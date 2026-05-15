const { ethers } = require("hardhat");
require("dotenv").config();

const crowdsaleAddress = process.env.CROWDSALE_ADDRESS;

async function main() {
  if (!crowdsaleAddress) {
    throw new Error("Please export CROWDSALE_ADDRESS environment variable.");
  }

  const signer = (await ethers.getSigners())[0];
  console.log(`Purchasing tokens with account: ${await signer.getAddress()}`);

  const crowdsale = await ethers.getContractAt(
    "Crowdsale",
    crowdsaleAddress,
    signer,
  );

  console.log(`CrowdSale contract: ${crowdsaleAddress}`);

  const ethAmount = ethers.parseUnits("0.0001", "ether");

  const tx = await crowdsale.buyTokens({
    value: ethAmount,
  });

  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();

  const tokenAddr = await crowdsale.token();

  const token = await ethers.getContractAt(
    "OwnableMintableDemoToken",
    tokenAddr,
  );

  const balance = await token.balanceOf(await signer.getAddress());

  console.log(`Token address: ${tokenAddr}`);
  console.log(`Tokens purchased: ${ethers.formatUnits(balance, 18)} DEMO`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
