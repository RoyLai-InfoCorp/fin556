const { ethers } = require("hardhat");

async function main() {
  const Pair = await ethers.getContractFactory("UniswapV2Pair");
  const initCodeHash = ethers.keccak256(Pair.bytecode);

  console.log("INIT_CODE_HASH:");
  console.log(initCodeHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
