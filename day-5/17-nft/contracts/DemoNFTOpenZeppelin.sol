// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DemoNFTOpenZeppelin is ERC721 {
    uint256 private _tokenIdCounter;

    constructor() ERC721("DemoNFT", "DNFT") {
        _tokenIdCounter = 0;
    }

    function mint(address to) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);

        return tokenId;
    }
}