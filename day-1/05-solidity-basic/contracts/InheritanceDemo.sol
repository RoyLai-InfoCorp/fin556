// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Animal {
    string public species;

    constructor(string memory _species) {
        species = _species;
    }

    function makeSound() public virtual pure returns (string memory) {
        return "Some generic animal sound";
    }

    function getSpecies() public view returns (string memory) {
        return species;
    }
}

contract Dog is Animal {
    constructor() Animal("Canine") {}

    function makeSound() public pure override returns (string memory) {
        return "Woof!";
    }

    function wagTail() public pure returns (string memory) {
        return "Tail wagging!";
    }
}