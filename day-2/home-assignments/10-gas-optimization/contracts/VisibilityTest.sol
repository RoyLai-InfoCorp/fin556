// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// ❌ 较低效：Public 函数复制到 memory
contract PublicContract {
    function processArray(uint256[] memory arr) public pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
}

// ✅ 较高效：External 函数使用 calldata
contract ExternalContract {
    function processArray(uint256[] calldata arr) external pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
}