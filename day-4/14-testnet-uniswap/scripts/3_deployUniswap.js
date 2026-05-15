const { ethers } = require("hardhat");
const { saveJson, getAddress, delay } = require("./deployLib.js");
const path = require("path");

const ADDRESS_FILE = "addresses.json";
const filePath = path.join(__dirname, ADDRESS_FILE);

async function main() {
    const signer = (await ethers.getSigners())[0];
    console.log(`Using account: ${await signer.getAddress()}`);

    const weth9 = getAddress(filePath, "weth9");

    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await Factory.deploy(await signer.getAddress());
    await factory.waitForDeployment();

    const factoryAddress = await factory.getAddress();
    console.log(`UniswapV2Factory deployed to: ${factoryAddress}`);

    await delay(3000);

    const Router = await ethers.getContractFactory("UniswapV2Router02");
    const router = await Router.deploy(factoryAddress, weth9);
    await router.waitForDeployment();

    const routerAddress = await router.getAddress();
    console.log(`UniswapV2Router02 deployed to: ${routerAddress}`);

    await delay(3000);

    saveJson(filePath, {
        factory: factoryAddress,
        router: routerAddress,
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
