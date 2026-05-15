const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", function () {
    let counter;

    beforeEach(async function () {
        const Counter = await ethers.getContractFactory("Counter");
        counter = await Counter.deploy(42);
        await counter.waitForDeployment();
    });

    it("Should set the initial count correctly", async function () {
        expect(await counter.count()).to.equal(42n);
    });

    it("Should increment the count by 1", async function () {
        await counter.increment();
        expect(await counter.count()).to.equal(43n);
    });
});