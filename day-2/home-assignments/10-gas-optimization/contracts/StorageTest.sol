// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// ❌ 低效：大类型阻止打包
contract Inefficient {
    uint8 a;    // 槽 0
    uint256 b;  // 槽 1
    uint8 c;    // 槽 2

    function setValues(uint8 _a, uint256 _b, uint8 _c) public {
        a = _a;
        b = _b;
        c = _c;
    }
}

// ✅ 高效：将小类型分组在一起
contract Efficient {
    uint8 a;    // 槽 0
    uint8 c;    // 槽 0，和 a 打包在一起
    uint256 b;  // 槽 1

    function setValues(uint8 _a, uint256 _b, uint8 _c) public {
        a = _a;
        c = _c;
        b = _b;
    }
}