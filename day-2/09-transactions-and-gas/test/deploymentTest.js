const { ethers } = require("hardhat");

describe("Contract Deployment Cost Comparison", () => {
    it("Deploy Counter Contract", async () => {
        const counterFactory = await ethers.getContractFactory("Counter");
        const counter = await counterFactory.deploy(5);
        const receipt = await counter.deploymentTransaction().wait();

        console.log(`Counter deployment gas: ${receipt.gasUsed}`);
    });

    it("Deploy DemoToken Contract", async () => {
        const [owner] = await ethers.getSigners();
        const erc20Factory = await ethers.getContractFactory("DemoToken");
        const totalSupply = ethers.parseUnits("1000", 18);

        const erc20 = await erc20Factory.deploy(totalSupply, owner.address);
        const receipt = await erc20.deploymentTransaction().wait();

        console.log(`DemoToken deployment gas: ${receipt.gasUsed}`);
    });
});