// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Counter.sol";

contract DepositCounter is Counter {
    mapping(address => uint256) public deposits;
    mapping(address => bool) public hasAccount;

    constructor() Counter(0) {}

    function deposit() public payable {
        require(msg.value > 0, "Must send ETH");

        if (hasAccount[msg.sender] == false) {
            increment();
            hasAccount[msg.sender] = true;
        }

        deposits[msg.sender] += msg.value;
    }

    function isDepositor(address addr) public view returns (bool) {
        return hasAccount[addr];
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}