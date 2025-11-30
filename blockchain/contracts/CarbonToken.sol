// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CarbonToken
 * @dev ERC20 token for rewarding recycling activities
 */
contract CarbonToken is ERC20, Ownable {
    address public rewardEngine;

    event RewardEnginedUpdated(address indexed newRewardEngine);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {
        // Initial supply can be minted to owner if needed
        // _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @dev Set the reward engine address (only callable by owner)
     * @param _rewardEngine Address of the RewardEngine contract
     */
    function setRewardEngine(address _rewardEngine) external onlyOwner {
        require(_rewardEngine != address(0), "Invalid reward engine address");
        rewardEngine = _rewardEngine;
        emit RewardEnginedUpdated(_rewardEngine);
    }

    /**
     * @dev Mint tokens to a user (only callable by reward engine)
     * @param to Recipient address
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == rewardEngine, "Only reward engine can mint");
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from a user
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Get token balance with decimals
     */
    function balanceOfWithDecimals(address account) external view returns (uint256) {
        return balanceOf(account) / (10 ** decimals());
    }
}
