const { ethers } = require("hardhat");

describe("Storage Efficiency Comparison", () => {
    it("Test inefficient storage (3 slots)", async () => {
        const factory = await ethers.getContractFactory("Inefficient");
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const tx = await contract.setValues(1, 1000, 2);
        const receipt = await tx.wait();

        console.log(`Inefficient storage gas: ${receipt.gasUsed}`);
    });

    it("Test efficient storage (2 slots)", async () => {
        const factory = await ethers.getContractFactory("Efficient");
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const tx = await contract.setValues(1, 1000, 2);
        const receipt = await tx.wait();

        console.log(`Efficient storage gas: ${receipt.gasUsed}`);
    });
});