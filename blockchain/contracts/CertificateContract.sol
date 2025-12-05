// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateContract
 * @dev Issues tamper-proof blockchain certificates for high-volume recyclers
 * @notice Certificates are issued for submissions of 40kg or more
 */
contract CertificateContract is Ownable {
    
    struct Certificate {
        uint256 certificateId;
        address recipient;
        address verifier;
        string recipientName;
        string verifierName;
        string verifierOrganization;
        uint256 totalWeight;        // in grams
        string wasteCategory;
        uint256 submissionId;
        uint256 tokensAwarded;
        uint256 issuedAt;
        bytes32 certificateHash;    // Tamper-proof hash
        bool isValid;
    }
    
    uint256 public certificateCounter;
    uint256 public constant MINIMUM_WEIGHT_GRAMS = 40000; // 40kg in grams
    
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public userCertificates;
    mapping(bytes32 => uint256) public hashToCertificate;
    
    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed recipient,
        address indexed verifier,
        uint256 totalWeight,
        bytes32 certificateHash,
        uint256 issuedAt
    );
    
    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed revokedBy,
        uint256 revokedAt
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Issue a new certificate
     * @param recipient Wallet address of the certificate recipient
     * @param verifier Wallet address of the verifier
     * @param recipientName Name of the recipient
     * @param verifierName Name of the verifier
     * @param verifierOrganization Organization of the verifier
     * @param totalWeightGrams Total weight in grams (must be >= 40000)
     * @param wasteCategory Category of waste recycled
     * @param submissionId ID of the submission in the database
     * @param tokensAwarded Number of tokens awarded
     */
    function issueCertificate(
        address recipient,
        address verifier,
        string memory recipientName,
        string memory verifierName,
        string memory verifierOrganization,
        uint256 totalWeightGrams,
        string memory wasteCategory,
        uint256 submissionId,
        uint256 tokensAwarded
    ) external returns (uint256, bytes32) {
        require(totalWeightGrams >= MINIMUM_WEIGHT_GRAMS, "Weight must be at least 40kg");
        require(recipient != address(0), "Invalid recipient address");
        require(verifier != address(0), "Invalid verifier address");
        
        certificateCounter++;
        
        // Create tamper-proof hash
        bytes32 certHash = keccak256(abi.encodePacked(
            certificateCounter,
            recipient,
            verifier,
            recipientName,
            verifierName,
            verifierOrganization,
            totalWeightGrams,
            wasteCategory,
            submissionId,
            tokensAwarded,
            block.timestamp,
            block.chainid
        ));
        
        certificates[certificateCounter] = Certificate({
            certificateId: certificateCounter,
            recipient: recipient,
            verifier: verifier,
            recipientName: recipientName,
            verifierName: verifierName,
            verifierOrganization: verifierOrganization,
            totalWeight: totalWeightGrams,
            wasteCategory: wasteCategory,
            submissionId: submissionId,
            tokensAwarded: tokensAwarded,
            issuedAt: block.timestamp,
            certificateHash: certHash,
            isValid: true
        });
        
        userCertificates[recipient].push(certificateCounter);
        hashToCertificate[certHash] = certificateCounter;
        
        emit CertificateIssued(
            certificateCounter,
            recipient,
            verifier,
            totalWeightGrams,
            certHash,
            block.timestamp
        );
        
        return (certificateCounter, certHash);
    }
    
    /**
     * @dev Verify a certificate by its hash
     * @param certHash The certificate hash to verify
     */
    function verifyCertificateByHash(bytes32 certHash) external view returns (
        bool isValid,
        uint256 certificateId,
        address recipient,
        uint256 totalWeight,
        uint256 issuedAt
    ) {
        uint256 certId = hashToCertificate[certHash];
        if (certId == 0) {
            return (false, 0, address(0), 0, 0);
        }
        
        Certificate memory cert = certificates[certId];
        return (
            cert.isValid,
            cert.certificateId,
            cert.recipient,
            cert.totalWeight,
            cert.issuedAt
        );
    }
    
    /**
     * @dev Get certificate details by ID
     * @param certificateId The certificate ID
     */
    function getCertificate(uint256 certificateId) external view returns (Certificate memory) {
        require(certificateId > 0 && certificateId <= certificateCounter, "Invalid certificate ID");
        return certificates[certificateId];
    }
    
    /**
     * @dev Get all certificate IDs for a user
     * @param user The user's wallet address
     */
    function getUserCertificates(address user) external view returns (uint256[] memory) {
        return userCertificates[user];
    }
    
    /**
     * @dev Get the number of certificates a user has
     * @param user The user's wallet address
     */
    function getUserCertificateCount(address user) external view returns (uint256) {
        return userCertificates[user].length;
    }
    
    /**
     * @dev Revoke a certificate (only owner)
     * @param certificateId The certificate ID to revoke
     */
    function revokeCertificate(uint256 certificateId) external onlyOwner {
        require(certificateId > 0 && certificateId <= certificateCounter, "Invalid certificate ID");
        require(certificates[certificateId].isValid, "Certificate already revoked");
        
        certificates[certificateId].isValid = false;
        
        emit CertificateRevoked(certificateId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Regenerate certificate hash for verification (view function)
     * @param certificateId The certificate ID to verify
     */
    function regenerateCertificateHash(uint256 certificateId) external view returns (bytes32) {
        require(certificateId > 0 && certificateId <= certificateCounter, "Invalid certificate ID");
        Certificate memory cert = certificates[certificateId];
        
        return keccak256(abi.encodePacked(
            cert.certificateId,
            cert.recipient,
            cert.verifier,
            cert.recipientName,
            cert.verifierName,
            cert.verifierOrganization,
            cert.totalWeight,
            cert.wasteCategory,
            cert.submissionId,
            cert.tokensAwarded,
            cert.issuedAt,
            block.chainid
        ));
    }
}
