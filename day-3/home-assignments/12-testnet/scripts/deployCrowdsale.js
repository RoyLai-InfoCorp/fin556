const { ethers } = require("hardhat");
require("dotenv").config();

const demoTokenAddress = process.env.DEMO_TOKEN_ADDRESS;

async function main() {
  if (!demoTokenAddress) {
    throw new Error("Please export DEMO_TOKEN_ADDRESS environment variable.");
  }

  const CrowdsaleFactory = await ethers.getContractFactory("Crowdsale");

  const crowdsale = await CrowdsaleFactory.deploy(demoTokenAddress, 1000);

  await crowdsale.waitForDeployment();

  const crowdsaleAddress = await crowdsale.getAddress();
  console.log(`Crowdsale deployed to: ${crowdsaleAddress}`);

  const demoToken = await ethers.getContractAt(
    "OwnableMintableDemoToken",
    demoTokenAddress,
  );

  const transferTx = await demoToken.transferOwnership(crowdsaleAddress);
  await transferTx.wait();

  console.log(
    `Transferred token ownership to Crowdsale at: ${crowdsaleAddress}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
