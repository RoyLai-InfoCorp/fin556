// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract Counter {
    uint256 public count;
    
    constructor(uint256 initial) { 
        count = initial; 
    }
    
    // State-changing function
    function increment() public { 
        count += 1; 
    }
    
    // View function (reads storage)
    function getCount() public view returns (uint256) {
        return count;
    }
    
    // Pure function (no storage access)
    function addNumbers(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
    
    // Pure function with more computation
    function calculateSquare(uint256 x) public pure returns (uint256) {
        return x * x;
    }
}
