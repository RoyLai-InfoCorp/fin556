const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test IPFSStorageNFT", () => {
  let nft;
  let owner;
  let addr1;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("IPFSStorageNFT");
    nft = await factory.deploy();
  });

  it("Should have correct name and symbol", async () => {
    expect(await nft.name()).to.equal("IPFSStorageNFT");
    expect(await nft.symbol()).to.equal("IPFS");
  });

  it("Should mint NFT with IPFS URI", async () => {
    const cid = "QmeRo8MrBWHRADr2UB6H3Mu7mPHgUvEzGb6mF2pesHCeEU";

    await nft.mint(addr1.address, cid);

    expect(await nft.balanceOf(addr1.address)).to.equal(1n);
    expect(await nft.ownerOf(0)).to.equal(addr1.address);
    expect(await nft.tokenURI(0)).to.equal(`ipfs://${cid}`);
  });

  it("Should mint multiple NFTs with different IPFS CIDs", async () => {
    const cids = [
      "QmeRo8MrBWHRADr2UB6H3Mu7mPHgUvEzGb6mF2pesHCeEU",
      "QmUVRhto3YzhnazJPTEpqjF7yZgH4EQv7iMGgyfWnHyVkC",
      "Qma8SAwuDMJCZtAkgRxLqn2gGCLzez6ZZqJYF932CZTo7b",
    ];

    for (let i = 0; i < cids.length; i++) {
      await nft.mint(addr1.address, cids[i]);
    }

    expect(await nft.totalSupply()).to.equal(3n);
    expect(await nft.balanceOf(addr1.address)).to.equal(3n);

    for (let i = 0; i < cids.length; i++) {
      expect(await nft.tokenURI(i)).to.equal(`ipfs://${cids[i]}`);
    }
  });
});
