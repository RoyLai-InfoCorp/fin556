// Script for testing the Uniswap init code hash against a deployed pair address.
const { ethers } = require("hardhat");

// Usage: INIT_CODE_HASH=0x... hh run scripts/testPairFor.js
async function getPairAddress(token0, token1, initCodeHash) {
    address0 = (await token0.getAddress()).toLowerCase();
    address1 = (await token1.getAddress()).toLowerCase();
    if (address0 > address1) {
        [address0, address1] = [address1, address0];
    }
    const pairAddress2 = ethers.getCreate2Address(
        factory.target,
        ethers.keccak256(
            ethers.solidityPacked(["address", "address"], [address0, address1]),
        ),
        initCodeHash,
    );
    return pairAddress2;
}

(async function main() {
    const initCodeHash = process.env.INIT_CODE_HASH || process.argv[2];
    if (!ethers.isHexString(initCodeHash, 32)) {
        throw new Error(
            "Usage: INIT_CODE_HASH=0x... hh run scripts/testPairFor.js (0x-prefixed, 32-byte hash)",
        );
    }

    const [signer] = await ethers.getSigners();

    // Deploy WETH9
    const WETH9 = await ethers.getContractFactory(
        "contracts/v2-periphery/test/WETH9.sol:WETH9",
    );
    weth9 = await WETH9.deploy();
    await weth9.waitForDeployment();
    weth9Address = await weth9.getAddress();

    // Deploy Token0
    const TokenA = await ethers.getContractFactory("DemoTokenA");
    token0 = await TokenA.deploy();
    await token0.waitForDeployment();
    token0Address = await token0.getAddress();

    // Deploy Token1
    const TokenB = await ethers.getContractFactory("DemoTokenB");
    token1 = await TokenB.deploy();
    await token1.waitForDeployment();
    token1Address = await token1.getAddress();

    // Deploy UniswapV2Factory
    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await Factory.deploy(signer.address);
    await factory.waitForDeployment();
    factoryAddress = await factory.getAddress();

    // Deploy UniswapV2Router02
    const Router = await ethers.getContractFactory("UniswapV2Router02");
    router = await Router.deploy(
        factory.target,
        weth9Address, // WETH address (not used in this test)
    );
    await router.waitForDeployment();
    routerAddress = await router.getAddress();
    console.log(`UniswapV2Router02 deployed to: ${routerAddress}`);

    // Create Pair
    token0 = await ethers.getContractAt("DemoTokenA", token0Address);
    token1 = await ethers.getContractAt("DemoTokenB", token1Address);
    factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress);
    const tx = await factory.createPair(
        await token0.getAddress(),
        await token1.getAddress(),
    );
    await tx.wait();
    pairAddress1 = await factory.getPair(
        await token0.getAddress(),
        await token1.getAddress(),
    );

    pairAddress2 = await getPairAddress(token0, token1, initCodeHash);
    if (pairAddress1.toLowerCase() === pairAddress2.toLowerCase()) {
        console.log("init code verified success! ✅");
    } else {
        console.log("init code failed! ❌");
    }
})().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
