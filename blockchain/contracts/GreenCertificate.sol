// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title GreenCertificate
 * @dev NFT-based certificates for large recycling contributors (>40kg donations)
 * These certificates are tamperproof and stored permanently on-chain
 */
contract GreenCertificate is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 private _tokenIdCounter;
    
    // Certificate data structure
    struct Certificate {
        uint256 tokenId;
        address recipient;
        string recipientName;
        uint256 totalWeight;      // Total weight in grams
        string category;          // Waste category
        uint256 issuedAt;         // Timestamp when issued
        string certificateType;   // "BRONZE", "SILVER", "GOLD", "PLATINUM"
        string ipfsMetadataHash;  // IPFS hash for additional metadata
    }
    
    // Mapping from token ID to certificate data
    mapping(uint256 => Certificate) public certificates;
    
    // Mapping from user address to their certificate IDs
    mapping(address => uint256[]) public userCertificates;
    
    // Certificate thresholds (in grams)
    uint256 public constant BRONZE_THRESHOLD = 40000;     // 40 kg
    uint256 public constant SILVER_THRESHOLD = 100000;    // 100 kg
    uint256 public constant GOLD_THRESHOLD = 500000;      // 500 kg
    uint256 public constant PLATINUM_THRESHOLD = 1000000; // 1000 kg (1 ton)
    
    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string recipientName,
        uint256 totalWeight,
        string certificateType,
        uint256 issuedAt
    );
    
    constructor() ERC721("Green Karma Certificate", "GKCERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint a new certificate for a large donor
     * @param to Recipient address
     * @param recipientName Name of the recipient
     * @param totalWeight Total recycled weight in grams
     * @param category Waste category
     * @param metadataURI IPFS URI for certificate metadata
     */
    function mintCertificate(
        address to,
        string memory recipientName,
        uint256 totalWeight,
        string memory category,
        string memory metadataURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(totalWeight >= BRONZE_THRESHOLD, "Weight must be at least 40kg for certificate");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        string memory certType = _determineCertificateType(totalWeight);
        
        // Store certificate data
        certificates[tokenId] = Certificate({
            tokenId: tokenId,
            recipient: to,
            recipientName: recipientName,
            totalWeight: totalWeight,
            category: category,
            issuedAt: block.timestamp,
            certificateType: certType,
            ipfsMetadataHash: metadataURI
        });
        
        // Add to user's certificates
        userCertificates[to].push(tokenId);
        
        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit CertificateMinted(
            tokenId,
            to,
            recipientName,
            totalWeight,
            certType,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @dev Determine certificate type based on weight
     */
    function _determineCertificateType(uint256 weight) internal pure returns (string memory) {
        if (weight >= PLATINUM_THRESHOLD) {
            return "PLATINUM";
        } else if (weight >= GOLD_THRESHOLD) {
            return "GOLD";
        } else if (weight >= SILVER_THRESHOLD) {
            return "SILVER";
        } else {
            return "BRONZE";
        }
    }
    
    /**
     * @dev Get certificate details by token ID
     */
    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        require(tokenId < _tokenIdCounter, "Certificate does not exist");
        return certificates[tokenId];
    }
    
    /**
     * @dev Get all certificate IDs for a user
     */
    function getUserCertificates(address user) external view returns (uint256[] memory) {
        return userCertificates[user];
    }
    
    /**
     * @dev Get total number of certificates issued
     */
    function getTotalCertificates() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Check if user qualifies for a certificate based on cumulative weight
     */
    function checkCertificateEligibility(uint256 totalWeight) external pure returns (bool eligible, string memory certificateType) {
        if (totalWeight >= BRONZE_THRESHOLD) {
            return (true, _determineCertificateType(totalWeight));
        }
        return (false, "");
    }
    
    /**
     * @dev Grant minter role to an address (e.g., RewardEngine or backend)
     */
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
