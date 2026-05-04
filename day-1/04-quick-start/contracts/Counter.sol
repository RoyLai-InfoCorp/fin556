// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;

    constructor(uint256 initial) {
        count = initial;
    }

    function increment() public {
        count += 1;
    }

    function get() public view returns (uint256) {
        return count;
    }
}