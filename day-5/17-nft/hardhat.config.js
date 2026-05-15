require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.24",
        settings: {
          evmVersion: "cancun",
        },
      },
    ],
  },
};
