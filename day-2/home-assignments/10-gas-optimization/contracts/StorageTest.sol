// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// ❌ Inefficient: Large types prevent packing
contract Inefficient {
    uint8 a;    // Slot 0
    uint256 b;  // Slot 1 (can't pack with uint8)
    uint8 c;    // Slot 2 (can't pack with uint256)
    
    function setValues(uint8 _a, uint256 _b, uint8 _c) public {
        a = _a;  // 20,000 gas (new storage slot)
        b = _b;  // 20,000 gas (new storage slot)
        c = _c;  // 20,000 gas (new storage slot)
    }
}

// ✅ Efficient: Group small types together
contract Efficient {
    uint8 a;    // Slot 0: byte 0
    uint8 c;    // Slot 0: byte 1 (packed together)
    uint256 b;  // Slot 1: separate slot for large type
    
    function setValues(uint8 _a, uint256 _b, uint8 _c) public {
        a = _a;  // 20,000 gas (new storage slot)
        c = _c;  // 5,000 gas (update existing slot)
        b = _b;  // 20,000 gas (new storage slot)
    }
}