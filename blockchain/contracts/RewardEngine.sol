// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CarbonToken.sol";
import "./RecycleRecordContract.sol";
import "./IdentityContract.sol";

/**
 * @title RewardEngine
 * @dev Calculates and distributes Carbon Token rewards based on recycling activities
 */
contract RewardEngine {
    CarbonToken public carbonToken;
    RecycleRecordContract public recycleRecordContract;
    IdentityContract public identityContract;

    // Reward rates per kg (in token units with 18 decimals)
    uint256 public constant PLASTIC_RATE = 5 * 10**18;  // 5 tokens per kg
    uint256 public constant PAPER_RATE = 3 * 10**18;    // 3 tokens per kg
    uint256 public constant METAL_RATE = 4 * 10**18;    // 4 tokens per kg
    uint256 public constant EWASTE_RATE = 12 * 10**18;  // 12 tokens per kg
    uint256 public constant ORGANIC_RATE = 1 * 10**18;  // 1 token per kg

    mapping(uint256 => bool) public rewardsClaimed;
    mapping(address => uint256) public totalRewardsEarned;

    event RewardCalculated(uint256 indexed recordId, address indexed user, uint256 rewardAmount);
    event RewardMinted(uint256 indexed recordId, address indexed user, uint256 amount);

    constructor(
        address _carbonTokenAddress,
        address _recycleRecordContractAddress,
        address _identityContractAddress
    ) {
        carbonToken = CarbonToken(_carbonTokenAddress);
        recycleRecordContract = RecycleRecordContract(_recycleRecordContractAddress);
        identityContract = IdentityContract(_identityContractAddress);
    }

    /**
     * @dev Calculate reward amount based on waste category and weight
     * @param category Waste category
     * @param weightInGrams Weight in grams
     * @return Reward amount in tokens (with 18 decimals)
     */
    function calculateReward(
        RecycleRecordContract.WasteCategory category,
        uint256 weightInGrams
    ) public pure returns (uint256) {
        uint256 rate;
        
        if (category == RecycleRecordContract.WasteCategory.Plastic) {
            rate = PLASTIC_RATE;
        } else if (category == RecycleRecordContract.WasteCategory.Paper) {
            rate = PAPER_RATE;
        } else if (category == RecycleRecordContract.WasteCategory.Metal) {
            rate = METAL_RATE;
        } else if (category == RecycleRecordContract.WasteCategory.EWaste) {
            rate = EWASTE_RATE;
        } else if (category == RecycleRecordContract.WasteCategory.Organic) {
            rate = ORGANIC_RATE;
        } else {
            revert("Invalid waste category");
        }

        // Convert grams to kg and calculate reward
        // weightInGrams / 1000 * rate
        return (weightInGrams * rate) / 1000;
    }

    /**
     * @dev Process reward for a verified recycling record
     * @param recordId ID of the recycling record
     */
    function processReward(uint256 recordId) external {
        require(!rewardsClaimed[recordId], "Reward already claimed");
        
        RecycleRecordContract.RecycleRecord memory record = recycleRecordContract.getRecord(recordId);
        require(record.verified, "Record not verified yet");
        require(identityContract.isUser(record.user), "Invalid user");

        uint256 rewardAmount = calculateReward(record.category, record.weight);
        
        rewardsClaimed[recordId] = true;
        totalRewardsEarned[record.user] += rewardAmount;

        // Mint tokens to user
        carbonToken.mint(record.user, rewardAmount);

        emit RewardCalculated(recordId, record.user, rewardAmount);
        emit RewardMinted(recordId, record.user, rewardAmount);
    }

    /**
     * @dev Get reward amount for a record without claiming
     * @param recordId ID of the recycling record
     */
    function getRewardAmount(uint256 recordId) external view returns (uint256) {
        RecycleRecordContract.RecycleRecord memory record = recycleRecordContract.getRecord(recordId);
        return calculateReward(record.category, record.weight);
    }

    /**
     * @dev Check if reward has been claimed for a record
     */
    function isRewardClaimed(uint256 recordId) external view returns (bool) {
        return rewardsClaimed[recordId];
    }

    /**
     * @dev Get total rewards earned by a user
     */
    function getUserTotalRewards(address user) external view returns (uint256) {
        return totalRewardsEarned[user];
    }

    /**
     * @dev Get reward rates for all categories
     */
    function getRewardRates() external pure returns (
        uint256 plastic,
        uint256 paper,
        uint256 metal,
        uint256 ewaste,
        uint256 organic
    ) {
        return (PLASTIC_RATE, PAPER_RATE, METAL_RATE, EWASTE_RATE, ORGANIC_RATE);
    }
}
