require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

module.exports = {
    solidity: "0.8.20",
    networks: {
        localhost: {
            url: "http://localhost:8545",
        },
        hardhat: {
            accounts: {
                mnemonic: process.env.FIN556_MNEMONIC,
            },
        },
    },
};