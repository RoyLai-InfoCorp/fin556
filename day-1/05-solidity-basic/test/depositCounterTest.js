const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DepositCounter", function () {
    let depositCounter;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const DepositCounter = await ethers.getContractFactory("DepositCounter");
        depositCounter = await DepositCounter.deploy();
        await depositCounter.waitForDeployment();
    });

    it("Should count depositor correctly", async function () {
        expect(await depositCounter.count()).to.equal(0n);

        await depositCounter.connect(addr1).deposit({
            value: ethers.parseEther("1.0"),
        });
        expect(await depositCounter.count()).to.equal(1n);

        await depositCounter.connect(addr1).deposit({
            value: ethers.parseEther("0.5"),
        });
        expect(await depositCounter.count()).to.equal(1n);

        await depositCounter.connect(addr2).deposit({
            value: ethers.parseEther("0.5"),
        });
        expect(await depositCounter.count()).to.equal(2n);
    });

    it("Should track balance correctly", async function () {
        expect(await depositCounter.deposits(addr1.address)).to.equal(0n);

        await depositCounter.connect(addr1).deposit({
            value: ethers.parseEther("1.0"),
        });
        expect(await depositCounter.deposits(addr1.address)).to.equal(
            ethers.parseEther("1.0")
        );

        await depositCounter.connect(addr1).deposit({
            value: ethers.parseEther("0.5"),
        });
        expect(await depositCounter.deposits(addr1.address)).to.equal(
            ethers.parseEther("1.5")
        );
    });
});