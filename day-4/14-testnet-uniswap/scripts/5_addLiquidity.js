const { ethers } = require("hardhat");
const addresses = require("./addresses.json");

async function main() {
  console.log("Adding liquidity...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const tokenA = await ethers.getContractAt("DemoTokenA", addresses.token0);

  const tokenB = await ethers.getContractAt("DemoTokenB", addresses.token1);

  const factory = await ethers.getContractAt(
    "UniswapV2Factory",
    addresses.factory,
  );

  const pairAddress = await factory.getPair(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
  );

  if (pairAddress === ethers.ZeroAddress) {
    console.error("Error: Pair does not exist. Deploy the pair first.");
    return;
  }

  console.log("Pair address:", pairAddress);

  const amountA = ethers.parseUnits("1000", "ether");
  const amountB = ethers.parseUnits("5000", "ether");

  let tx = await tokenA.approve(addresses.router, amountA);
  await tx.wait();

  tx = await tokenB.approve(addresses.router, amountB);
  await tx.wait();

  const router = await ethers.getContractAt(
    "UniswapV2Router02",
    addresses.router,
  );

  const block = await ethers.provider.getBlock("latest");
  const deadline = block.timestamp + 600;

  tx = await router.addLiquidity(
    addresses.token0,
    addresses.token1,
    amountA,
    amountB,
    0,
    0,
    deployer.address,
    deadline,
  );

  await tx.wait();
  console.log("Liquidity added.");

  const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

  const lpBalance = await pair.balanceOf(deployer.address);
  console.log(
    `LP Balance of ${deployer.address}:`,
    ethers.formatUnits(lpBalance, 18),
  );

  const reserves = await pair.getReserves();

  const [reserves0, reserves1] =
    (await tokenA.getAddress()).toLowerCase() <
    (await tokenB.getAddress()).toLowerCase()
      ? [reserves[0], reserves[1]]
      : [reserves[1], reserves[0]];

  console.log(
    `Reserves: ${ethers.formatUnits(reserves0, 18)} / ${ethers.formatUnits(
      reserves1,
      18,
    )}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
