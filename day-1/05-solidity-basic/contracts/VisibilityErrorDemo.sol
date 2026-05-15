// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VisibilityErrorDemo {
    uint256 private secretNumber = 42;

    function publicFunction() public pure returns (string memory) {
        return "Anyone can call this";
    }

    function privateFunction() private pure returns (uint256) {
        return secretNumber;
    }

    function externalFunction() external pure returns (string memory) {
        return "Called from outside";
    }
}