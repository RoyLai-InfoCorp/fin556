const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Exit Position", function () {
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
      "0x0000000000000000000000000000000000000000",
    );

    // Deploy Token0
    const TokenA = await ethers.getContractFactory("DemoTokenA");
    token0 = await TokenA.deploy();

    // Deploy Token1
    const TokenB = await ethers.getContractFactory("DemoTokenB");
    token1 = await TokenB.deploy();

    // Create pair
    await factory.createPair(
      await token0.getAddress(),
      await token1.getAddress(),
    );

    // Add 1000 token0 and 5000 token1 as liquidity
    const amount0 = ethers.parseEther("1000");
    const amount1 = ethers.parseEther("5000");

    await token0.approve(await router.getAddress(), amount0);
    await token1.approve(await router.getAddress(), amount1);

    await router.addLiquidity(
      await token0.getAddress(),
      await token1.getAddress(),
      amount0,
      amount1,
      0,
      0,
      signer.address,
      ethers.MaxUint256,
    );

    // Buy 100 token0 using token1 to change the pool reserves
    const amountOut = ethers.parseEther("100");
    const path = [await token1.getAddress(), await token0.getAddress()];
    const to = signer.address;

    const amountIn =
      (amount1 * amountOut * 1000n) / ((amount0 - amountOut) * 997n) + 1n;

    await token1.approve(await router.getAddress(), amountIn);

    await router.swapTokensForExactTokens(
      amountOut,
      amountIn,
      path,
      to,
      ethers.MaxUint256,
    );
  });

  it("Should remove liquidity and receive tokens", async function () {
    // Step 1: Get pair contract
    // -----------------------------------------------------------------
    const pairAddress = await factory.getPair(
      await token0.getAddress(),
      await token1.getAddress(),
    );
    const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

    // Step 2: Check LP token balance
    // -----------------------------------------------------------------
    const lpBalance = await pair.balanceOf(signer.address);
    console.log("LP Balance:", ethers.formatEther(lpBalance));

    const beforeLiquidation0 = await token0.balanceOf(signer.address);
    const beforeLiquidation1 = await token1.balanceOf(signer.address);

    // Step 3: Approve router to spend LP tokens
    // -----------------------------------------------------------------
    await pair.approve(await router.getAddress(), lpBalance);

    // Step 4: Remove liquidity
    // -----------------------------------------------------------------
    const amount0Min = 0;
    const amount1Min = 0;

    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 1000;

    await router.removeLiquidity(
      await token0.getAddress(),
      await token1.getAddress(),
      lpBalance,
      amount0Min,
      amount1Min,
      signer.address,
      deadline,
    );

    // Step 5: Check balances after removing liquidity
    // -----------------------------------------------------------------
    const afterLiquidation0 = await token0.balanceOf(signer.address);
    const afterLiquidation1 = await token1.balanceOf(signer.address);

    console.log(
      "Receives Token0:",
      ethers.formatEther(afterLiquidation0 - beforeLiquidation0),
    );

    console.log(
      "Receives Token1:",
      ethers.formatEther(afterLiquidation1 - beforeLiquidation1),
    );

    const totalSupply = await pair.totalSupply();
    console.log("Total Supply:", totalSupply);

    expect(totalSupply).to.equal(1000n);
  });
});
