const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test DemoNFT", () => {
  let nft;
  let accounts;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const factory = await ethers.getContractFactory("DemoNFT");
    nft = await factory.deploy("DemoNFT", "DNFT");
  });

  it("Should have correct name and symbol", async () => {
    expect(await nft.name()).to.equal("DemoNFT");
    expect(await nft.symbol()).to.equal("DNFT");
  });

  it("Should mint NFT to account[0]", async () => {
    await nft.mint(accounts[0].address);

    const balance = await nft.balanceOf(accounts[0].address);
    expect(balance).to.equal(1n);
  });

  it("Should return correct owner of tokenId", async () => {
    await nft.mint(accounts[0].address);

    const owner = await nft.ownerOf(0);
    expect(owner).to.equal(accounts[0].address);
  });

  it("Should mint multiple NFTs", async () => {
    await nft.mint(accounts[0].address);
    await nft.mint(accounts[0].address);
    await nft.mint(accounts[0].address);

    const balance = await nft.balanceOf(accounts[0].address);
    expect(balance).to.equal(3n);
  });

  it("Should transfer NFT from accounts[0] to accounts[1]", async () => {
    await nft.mint(accounts[0].address);

    const beforeBalance0 = await nft.balanceOf(accounts[0].address);
    const beforeBalance1 = await nft.balanceOf(accounts[1].address);

    await nft.transferFrom(accounts[0].address, accounts[1].address, 0);

    const afterBalance0 = await nft.balanceOf(accounts[0].address);
    const afterBalance1 = await nft.balanceOf(accounts[1].address);

    expect(beforeBalance0 - 1n).to.equal(afterBalance0);
    expect(beforeBalance1 + 1n).to.equal(afterBalance1);
    expect(await nft.ownerOf(0)).to.equal(accounts[1].address);
  });

  it("Should approve and transfer NFT", async () => {
    await nft.mint(accounts[0].address);

    await nft.connect(accounts[0]).approve(accounts[1].address, 0);

    const approved = await nft.getApproved(0);
    expect(approved).to.equal(accounts[1].address);

    await nft
      .connect(accounts[1])
      .transferFrom(accounts[0].address, accounts[2].address, 0);

    expect(await nft.ownerOf(0)).to.equal(accounts[2].address);
  });
});
