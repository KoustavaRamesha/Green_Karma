// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IdentityContract
 * @dev Manages user and verifier registration with role-based access control
 */
contract IdentityContract is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    struct User {
        bytes32 identityHash;
        address walletAddress;
        bool isRegistered;
        uint256 registeredAt;
    }

    struct Verifier {
        address walletAddress;
        string organization;
        bool isActive;
        uint256 registeredAt;
    }

    mapping(address => User) public users;
    mapping(address => Verifier) public verifiers;
    
    address[] public userAddresses;
    address[] public verifierAddresses;

    event UserRegistered(address indexed userAddress, bytes32 identityHash, uint256 timestamp);
    event VerifierRegistered(address indexed verifierAddress, string organization, uint256 timestamp);
    event VerifierDeactivated(address indexed verifierAddress, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register a new user
     * @param identityHash Hash of user's identity data (off-chain)
     * @param walletAddress User's wallet address
     */
    function registerUser(bytes32 identityHash, address walletAddress) external {
        require(!users[walletAddress].isRegistered, "User already registered");
        require(walletAddress != address(0), "Invalid wallet address");

        users[walletAddress] = User({
            identityHash: identityHash,
            walletAddress: walletAddress,
            isRegistered: true,
            registeredAt: block.timestamp
        });

        _grantRole(USER_ROLE, walletAddress);
        userAddresses.push(walletAddress);

        emit UserRegistered(walletAddress, identityHash, block.timestamp);
    }

    /**
     * @dev Register a new verifier (government official)
     * @param walletAddress Verifier's wallet address
     * @param organization Verifier's organization name
     */
    function registerVerifier(address walletAddress, string memory organization) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!verifiers[walletAddress].isActive, "Verifier already registered");
        require(walletAddress != address(0), "Invalid wallet address");

        verifiers[walletAddress] = Verifier({
            walletAddress: walletAddress,
            organization: organization,
            isActive: true,
            registeredAt: block.timestamp
        });

        _grantRole(VERIFIER_ROLE, walletAddress);
        verifierAddresses.push(walletAddress);

        emit VerifierRegistered(walletAddress, organization, block.timestamp);
    }

    /**
     * @dev Deactivate a verifier
     * @param walletAddress Verifier's wallet address
     */
    function deactivateVerifier(address walletAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(verifiers[walletAddress].isActive, "Verifier not active");
        
        verifiers[walletAddress].isActive = false;
        _revokeRole(VERIFIER_ROLE, walletAddress);

        emit VerifierDeactivated(walletAddress, block.timestamp);
    }

    /**
     * @dev Check if address is a registered user
     */
    function isUser(address userAddress) external view returns (bool) {
        return users[userAddress].isRegistered;
    }

    /**
     * @dev Check if address is an active verifier
     */
    function isVerifier(address verifierAddress) external view returns (bool) {
        return verifiers[verifierAddress].isActive;
    }

    /**
     * @dev Get user details
     */
    function getUser(address userAddress) external view returns (User memory) {
        return users[userAddress];
    }

    /**
     * @dev Get verifier details
     */
    function getVerifier(address verifierAddress) external view returns (Verifier memory) {
        return verifiers[verifierAddress];
    }

    /**
     * @dev Get total number of registered users
     */
    function getUserCount() external view returns (uint256) {
        return userAddresses.length;
    }

    /**
     * @dev Get total number of registered verifiers
     */
    function getVerifierCount() external view returns (uint256) {
        return verifierAddresses.length;
    }
}
