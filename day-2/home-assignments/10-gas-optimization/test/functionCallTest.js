const { ethers } = require("hardhat");

describe("Contract Function Call Costs", () => {
    it("Test pure functions (no storage access)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        const addResult = await counter.addNumbers(5, 3);
        const squareResult = await counter.calculateSquare(7);

        console.log(
            `Pure functions - Add: ${addResult}, Square: ${squareResult} - FREE`
        );
    });

    it("Test view functions (read storage)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        const count1 = await counter.getCount();
        const count2 = await counter.count();

        console.log(
            `View functions - getCount: ${count1}, count: ${count2} - FREE`
        );
    });

    it("Test state-changing functions (modify storage)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        const tx = await counter.increment();
        const receipt = await tx.wait();

        console.log(`State change gas used: ${receipt.gasUsed}`);

        const newCount = await counter.count();
        console.log(`Count after increment: ${newCount}`);
    });
});