const { ethers } = require("hardhat");
const { saveJson, delay } = require("./deployLib.js");
const path = require("path");

const ADDRESS_FILE = "addresses.json";
const filePath = path.join(__dirname, ADDRESS_FILE);

async function main() {
  const signer = (await ethers.getSigners())[0];
  console.log(`Using account: ${await signer.getAddress()}`);

  const TokenA = await ethers.getContractFactory("DemoTokenA");
  const tokenA = await TokenA.deploy();
  await tokenA.waitForDeployment();

  const tokenAAddress = await tokenA.getAddress();
  console.log(`DemoTokenA deployed to: ${tokenAAddress}`);

  await delay(3000);

  const TokenB = await ethers.getContractFactory("DemoTokenB");
  const tokenB = await TokenB.deploy();
  await tokenB.waitForDeployment();

  const tokenBAddress = await tokenB.getAddress();
  console.log(`DemoTokenB deployed to: ${tokenBAddress}`);

  await delay(3000);

  saveJson(filePath, {
    tokenA: tokenAAddress,
    tokenB: tokenBAddress,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
