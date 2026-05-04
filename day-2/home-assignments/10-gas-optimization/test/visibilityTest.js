const { ethers } = require("hardhat");

describe("Function Visibility Gas Costs", () => {
    it("Test public function (memory parameters)", async () => {
        const factory = await ethers.getContractFactory("PublicContract");
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const testArray = [1, 2, 3, 4, 5];
        const gas = await contract.processArray.estimateGas(testArray);

        console.log(`Public function gas: ${gas}`);
    });

    it("Test external function (calldata parameters)", async () => {
        const factory = await ethers.getContractFactory("ExternalContract");
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const testArray = [1, 2, 3, 4, 5];
        const gas = await contract.processArray.estimateGas(testArray);

        console.log(`External function gas: ${gas}`);
    });
});