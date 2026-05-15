// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IPFSStorageNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("IPFSStorageNFT", "IPFS") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    function mint(address to, string memory ipfsCID) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);

        string memory uri = string(abi.encodePacked("ipfs://", ipfsCID));
        _setTokenURI(tokenId, uri);

        return tokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}