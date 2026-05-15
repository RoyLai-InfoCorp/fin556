// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DataTypesDemo {
    uint256 public myUint = 123;
    bool public myBool = true;
    address public myAddress = 0x000000000000000000000000000000000000dEaD;
    bytes32 public myBytes = "Hi";

    string public myString = "Hello Solidity";
    uint256[] public myArray;
    mapping(address => uint256) public balances;

    function addToArray(uint256 x) public {
        myArray.push(x);
    }

    function setBalance(uint256 amount) public {
        balances[msg.sender] = amount;
    }
}