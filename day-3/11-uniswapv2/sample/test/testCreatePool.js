const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Create Pool", function () {
  let signer;
  let factory, router, token0, token1;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();

    // Deploy UniswapV2Factory
    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await Factory.deploy(signer.address);

    // Deploy UniswapV2Router02
    const Router = await ethers.getContractFactory("UniswapV2Router02");
    router = await Router.deploy(
      factory.target,
      "0x0000000000000000000000000000000000000000", // WETH address (not used in this test)
    );

    // Deploy Token0
    const TokenA = await ethers.getContractFactory("DemoTokenA");
    token0 = await TokenA.deploy();
    console.log("Token0 address:", await token0.getAddress());

    // Deploy Token1
    const TokenB = await ethers.getContractFactory("DemoTokenB");
    token1 = await TokenB.deploy();
    console.log("Token1 address:", await token1.getAddress());
  });

  it("Should create a new pair and add liquidity successfully", async function () {
    // Step 1: Create a Pool
    // -----------------------------------------------------------------

    tx = await factory.createPair(
      await token0.getAddress(),
      await token1.getAddress(),
    );
    receipt = await tx.wait();

    // Step 2: Get Pool Address
    // -----------------------------------------------------------------

    // Method 1 - Events: Get the pair address from PairCreated event after creating the pair
    // Use this method when you want to get the pair address immediately after creating it.

    const logs = await factory.queryFilter(factory.filters.PairCreated(null));
    pairAddress = logs[0].args.pair;
    console.log("Pair address:", pairAddress);
    expect(pairAddress).to.be.properAddress;
    expect(pairAddress).to.not.equal(ethers.ZeroAddress);

    // Method 2 - On-Chain: Check the pair address by calling the Factory contract on-chain
    // Use this method when you want to find a pair using reserve token addresses but need to make an on-chain call.

    let pairAddress1 = await factory.getPair(
      await token0.getAddress(),
      await token1.getAddress(),
    );
    expect(pairAddress1).to.equal(pairAddress);

    // Method 3 - Off-Chain: Check the pair address using CREATE2 calculation (preferred)
    // Use this method when you want to find a pair using reserve token addresses without relying on on-chain calls.
    // However, this method requires knowing the init code hash of the UniswapV2Pair contract in your deployment environment.
    // The init code hash may vary between different environments (e.g., local, testnet, mainnet).

    const pairAddress2 = ethers.getCreate2Address(
      factory.target,
      ethers.keccak256(
        ethers.solidityPacked(
          ["address", "address"],
          [await token0.getAddress(), await token1.getAddress()],
        ),
      ),
      "96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f", // init code hash
    );
    expect(pairAddress2).to.equal(pairAddress);

    // Step 3: Approve Token Transfers
    // -----------------------------------------------------------------

    const amount0 = ethers.parseEther("1000");
    const amount1 = ethers.parseEther("5000");
    await token0.approve(await router.getAddress(), amount0);
    await token1.approve(await router.getAddress(), amount1);

    // Step 4: Add Liquidity
    // -----------------------------------------------------------------

    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 1000;
    await router.addLiquidity(
      await token0.getAddress(),
      await token1.getAddress(),
      amount0,
      amount1,
      0,
      0,
      await signer.getAddress(),
      deadline,
    );

    // Step 5: Check Pool Reserves
    // -----------------------------------------------------------------

    // Get the pair contract instance
    const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

    // Get current reserves
    const reserves = await pair.getReserves();

    // IMPORTANT: Make sure to map reserves correctly based on token addresses
    const [reserve0, reserve1] =
      (await token0.getAddress()) < (await token1.getAddress())
        ? [reserves[0], reserves[1]]
        : [reserves[1], reserves[0]];

    console.log("Reserve0:", ethers.formatEther(reserve0));
    expect(reserve0).to.equal(amount0);
    console.log("Reserve1:", ethers.formatEther(reserve1));
    expect(reserve1).to.equal(amount1);

    // Get LP token balance of liquidity provider

    const lpBalance = await pair.balanceOf(await signer.getAddress());
    console.log("LP Token Balance:", ethers.formatEther(lpBalance));

    // Check LP Balance against formula: sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY (1000)

    // We need to implement sqrt for BigInt since JS Math.sqrt only works with Number type
    function sqrtBigInt(value) {
      if (value < 0n) {
        throw new Error("Square root of negative numbers is not supported");
      }

      if (value < 2n) {
        return value;
      }

      // Newton's method for integer square root
      let x = value;
      let y = (x + 1n) / 2n;

      while (y < x) {
        x = y;
        y = (x + value / x) / 2n;
      }

      return x;
    }

    const computedLpBalance = sqrtBigInt(amount0 * amount1) - 1000n; // minus MINIMUM_LIQUIDITY (1000)
    console.log(
      "Computed LP Token Balance:",
      ethers.formatEther(computedLpBalance),
    );
    expect(lpBalance).to.equal(computedLpBalance);
  });
});
