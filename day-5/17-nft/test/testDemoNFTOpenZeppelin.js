const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test DemoNFTOpenZeppelin", () => {
  let nft;
  let accounts;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const factory = await ethers.getContractFactory("DemoNFTOpenZeppelin");
    nft = await factory.deploy();
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

  it("Should transfer NFT", async () => {
    await nft.mint(accounts[0].address);

    await nft.transferFrom(accounts[0].address, accounts[1].address, 0);

    expect(await nft.ownerOf(0)).to.equal(accounts[1].address);
  });
});
