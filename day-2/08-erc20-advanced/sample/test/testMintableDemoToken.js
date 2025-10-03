const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MintableDemoToken", function () {
    let token;
    let owner;
    let addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("MintableDemoToken");
        token = await Token.deploy(1000, owner.address);
    });

    it("Should have correct name and symbol", async function () {
        expect(await token.name()).to.equal("DemoToken");
        expect(await token.symbol()).to.equal("DEMO");
    });

    it("Should assign initial supply to owner", async function () {
        const ownerBalance = await token.balanceOf(owner.address);
        expect(ownerBalance).to.equal(1000n);
    });

    it("Should mint new tokens", async function () {
        await token.mint(addr1.address, 500);
        const addr1Balance = await token.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(500n);
    });
});
