const { ethers } = require("hardhat");

async function main() {
  const signer = (await ethers.getSigners())[0];
  console.log(`Using account: ${await signer.getAddress()}`);

  const factory = await ethers.getContractFactory("OwnableMintableDemoToken");

  const demoToken = await factory.deploy(
    ethers.parseUnits("1", "ether"),
    signer.address,
  );

  await demoToken.waitForDeployment();

  const demoTokenAddress = await demoToken.getAddress();
  console.log(`DemoToken deployed to: ${demoTokenAddress}`);

  const deploymentTx = demoToken.deploymentTransaction();
  const receipt = await ethers.provider.getTransactionReceipt(
    deploymentTx.hash,
  );

  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  console.log(
    `Gas price: ${ethers.formatUnits(deploymentTx.gasPrice, "gwei")} gwei`,
  );

  const totalCost = receipt.gasUsed * deploymentTx.gasPrice;
  console.log(`Total deployment cost: ${ethers.formatEther(totalCost)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
