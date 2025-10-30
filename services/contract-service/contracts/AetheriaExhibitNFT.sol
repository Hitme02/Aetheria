// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AetheriaExhibitNFT
 * @dev ERC-721 NFT contract for Aetheria decentralized art museum
 */
contract AetheriaExhibitNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    event Minted(address indexed creator, uint256 tokenId, string tokenURI);

    constructor() ERC721("AetheriaExhibit", "AETH") Ownable(msg.sender) {
        nextTokenId = 1;
    }

    /**
     * @dev Mint a new artwork NFT
     * @param creator The address that will own the NFT
     * @param tokenURI The URI pointing to the metadata
     * @return The ID of the newly minted token
     */
    function mintArtwork(address creator, string calldata tokenURI)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(creator, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit Minted(creator, tokenId, tokenURI);

        return tokenId;
    }

    /**
     * @dev Get total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return nextTokenId - 1;
    }
}

