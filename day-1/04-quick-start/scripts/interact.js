const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.attach(contractAddress);

    let current = await counter.count();
    console.log("Current count:", current.toString());

    const tx = await counter.increment();
    await tx.wait();

    let updated = await counter.count();
    console.log("Updated count:", updated.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});