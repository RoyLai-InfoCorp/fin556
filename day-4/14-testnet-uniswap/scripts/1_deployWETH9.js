const { ethers } = require("hardhat");
const { saveJson, delay } = require("./deployLib.js");
const path = require("path");

const ADDRESS_FILE = "addresses.json";
const filePath = path.join(__dirname, ADDRESS_FILE);

async function main() {
    const signer = (await ethers.getSigners())[0];
    console.log(`Using account: ${await signer.getAddress()}`);

    const WETH9 = await ethers.getContractFactory(
        "contracts/v2-periphery/test/WETH9.sol:WETH9"
    );

    const weth9 = await WETH9.deploy();
    await weth9.waitForDeployment();

    const weth9Address = await weth9.getAddress();
    console.log(`WETH9 deployed to: ${weth9Address}`);

    await delay(3000);

    saveJson(filePath, { weth9: weth9Address });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
