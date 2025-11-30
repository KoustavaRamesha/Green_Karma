// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IdentityContract.sol";

/**
 * @title RecycleRecordContract
 * @dev Records recycling events with verifier validation
 */
contract RecycleRecordContract {
    IdentityContract public identityContract;

    enum WasteCategory { Plastic, Paper, Metal, EWaste, Organic }

    struct RecycleRecord {
        uint256 recordId;
        address user;
        address verifier;
        WasteCategory category;
        uint256 weight; // in grams
        string ipfsHash; // Photo hash on IPFS
        uint256 timestamp;
        bool verified;
    }

    uint256 public recordCounter;
    mapping(uint256 => RecycleRecord) public records;
    mapping(address => uint256[]) public userRecords;
    mapping(address => uint256[]) public verifierRecords;

    event RecyclingRecorded(
        uint256 indexed recordId,
        address indexed user,
        address indexed verifier,
        WasteCategory category,
        uint256 weight,
        string ipfsHash,
        uint256 timestamp
    );

    event RecyclingVerified(
        uint256 indexed recordId,
        address indexed verifier,
        uint256 timestamp
    );

    constructor(address _identityContractAddress) {
        identityContract = IdentityContract(_identityContractAddress);
    }

    /**
     * @dev Record a recycling event
     * @param user User's wallet address
     * @param verifier Verifier's wallet address
     * @param category Type of waste
     * @param weight Weight in grams
     * @param ipfsHash IPFS hash of waste photo
     */
    function recordRecycling(
        address user,
        address verifier,
        WasteCategory category,
        uint256 weight,
        string memory ipfsHash
    ) external returns (uint256) {
        require(identityContract.isUser(user), "User not registered");
        require(identityContract.isVerifier(verifier), "Verifier not registered");
        require(weight > 0, "Weight must be greater than 0");

        recordCounter++;
        
        records[recordCounter] = RecycleRecord({
            recordId: recordCounter,
            user: user,
            verifier: verifier,
            category: category,
            weight: weight,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            verified: false
        });

        userRecords[user].push(recordCounter);
        verifierRecords[verifier].push(recordCounter);

        emit RecyclingRecorded(
            recordCounter,
            user,
            verifier,
            category,
            weight,
            ipfsHash,
            block.timestamp
        );

        return recordCounter;
    }

    /**
     * @dev Verify a recycling record
     * @param recordId ID of the record to verify
     */
    function verifyRecycling(uint256 recordId) external {
        require(recordId > 0 && recordId <= recordCounter, "Invalid record ID");
        RecycleRecord storage record = records[recordId];
        require(msg.sender == record.verifier, "Only assigned verifier can verify");
        require(!record.verified, "Record already verified");

        record.verified = true;

        emit RecyclingVerified(recordId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get record details
     */
    function getRecord(uint256 recordId) external view returns (RecycleRecord memory) {
        require(recordId > 0 && recordId <= recordCounter, "Invalid record ID");
        return records[recordId];
    }

    /**
     * @dev Get all records for a user
     */
    function getUserRecords(address user) external view returns (uint256[] memory) {
        return userRecords[user];
    }

    /**
     * @dev Get all records verified by a verifier
     */
    function getVerifierRecords(address verifier) external view returns (uint256[] memory) {
        return verifierRecords[verifier];
    }

    /**
     * @dev Get total number of records
     */
    function getTotalRecords() external view returns (uint256) {
        return recordCounter;
    }

    /**
     * @dev Convert waste category to string
     */
    function getCategoryString(WasteCategory category) public pure returns (string memory) {
        if (category == WasteCategory.Plastic) return "Plastic";
        if (category == WasteCategory.Paper) return "Paper";
        if (category == WasteCategory.Metal) return "Metal";
        if (category == WasteCategory.EWaste) return "E-waste";
        if (category == WasteCategory.Organic) return "Organic";
        return "Unknown";
    }
}
