// Calculate the Uniswap V2 pair init code hash used to predict CREATE2 addresses.
// Usage: npx hardhat run scripts/getInitCodeHash.js
const { artifacts, ethers } = require("hardhat");

async function main() {
    const pair = await artifacts.readArtifact(
        "contracts/v2-core/UniswapV2Pair.sol:UniswapV2Pair",
    );
    console.log(ethers.keccak256(pair.bytecode));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
