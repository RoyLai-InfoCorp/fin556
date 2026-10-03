const { ethers } = require("ethers");
const bytecode =
    require("../artifacts/contracts/v2-core/UniswapV2Pair.sol/UniswapV2Pair.json").bytecode;
console.log(ethers.keccak256(bytecode));
