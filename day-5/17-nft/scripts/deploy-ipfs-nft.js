const { ethers } = require("hardhat");

async function main() {
  const factory = await ethers.getContractFactory("IPFSStorageNFT");

  const nft = await factory.deploy();
  await nft.waitForDeployment();

  const nftAddress = await nft.getAddress();
  console.log("IPFSStorageNFT deployed to:", nftAddress);

  const [owner] = await ethers.getSigners();
  console.log("Deployer address:", owner.address);

  const cids = [
    "QmeRo8MrBWHRADr2UB6H3Mu7mPHgUvEzGb6mF2pesHCeEU",
    "QmUVRhto3YzhnazJPTEpqjF7yZgH4EQv7iMGgyfWnHyVkC",
    "Qma8SAwuDMJCZtAkgRxLqn2gGCLzez6ZZqJYF932CZTo7b",
  ];

  for (let i = 0; i < cids.length; i++) {
    const tx = await nft.mint(owner.address, cids[i]);
    await tx.wait();

    console.log(`Minted NFT ${i} with CID: ${cids[i]}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
