const { ethers } = require("hardhat");

async function main() {
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy(42);
    await counter.waitForDeployment();

    console.log(`Counter deployed to: ${counter.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});