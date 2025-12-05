// Blockchain Interaction Service for Green Karma
// Direct contract calls using ethers.js

import { ethers } from 'ethers';
import {
    CONTRACT_ADDRESSES,
    IDENTITY_ABI,
    RECYCLE_RECORD_ABI,
    CARBON_TOKEN_ABI,
    REWARD_ENGINE_ABI,
    WASTE_CATEGORIES,
    CATEGORY_NAMES,
} from './contracts';

class BlockchainService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.initialized = false;
    }

    // Initialize blockchain connection
    async initialize() {
        if (this.initialized) return true;

        try {
            if (typeof window !== 'undefined' && window.ethereum) {
                this.provider = new ethers.BrowserProvider(window.ethereum);
                this.signer = await this.provider.getSigner();

                // Initialize contract instances
                this.contracts = {
                    identity: new ethers.Contract(CONTRACT_ADDRESSES.IdentityContract, IDENTITY_ABI, this.signer),
                    recycleRecord: new ethers.Contract(CONTRACT_ADDRESSES.RecycleRecordContract, RECYCLE_RECORD_ABI, this.signer),
                    carbonToken: new ethers.Contract(CONTRACT_ADDRESSES.CarbonToken, CARBON_TOKEN_ABI, this.signer),
                    rewardEngine: new ethers.Contract(CONTRACT_ADDRESSES.RewardEngine, REWARD_ENGINE_ABI, this.signer),
                };

                this.initialized = true;
                console.log('✅ Blockchain service initialized');
                return true;
            } else {
                console.warn('⚠️ No Ethereum provider found');
                return false;
            }
        } catch (error) {
            console.error('❌ Blockchain initialization error:', error);
            return false;
        }
    }

    // Get read-only contract (no signer needed)
    getReadOnlyContract(contractName) {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const abiMap = {
            identity: IDENTITY_ABI,
            recycleRecord: RECYCLE_RECORD_ABI,
            carbonToken: CARBON_TOKEN_ABI,
            rewardEngine: REWARD_ENGINE_ABI,
        };

        const addressMap = {
            identity: CONTRACT_ADDRESSES.IdentityContract,
            recycleRecord: CONTRACT_ADDRESSES.RecycleRecordContract,
            carbonToken: CONTRACT_ADDRESSES.CarbonToken,
            rewardEngine: CONTRACT_ADDRESSES.RewardEngine,
        };

        return new ethers.Contract(addressMap[contractName], abiMap[contractName], provider);
    }

    // ========== IDENTITY CONTRACT FUNCTIONS ==========

    // Register user on blockchain
    async registerUserOnChain(identityHash, walletAddress) {
        await this.initialize();
        const hashBytes = ethers.encodeBytes32String(identityHash.substring(0, 31));
        const tx = await this.contracts.identity.registerUser(hashBytes, walletAddress);
        const receipt = await tx.wait();
        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    // Check if user is registered on blockchain
    async isUserRegistered(walletAddress) {
        const contract = this.getReadOnlyContract('identity');
        return await contract.isUser(walletAddress);
    }

    // Check if verifier is registered on blockchain
    async isVerifierRegistered(walletAddress) {
        const contract = this.getReadOnlyContract('identity');
        return await contract.isVerifier(walletAddress);
    }

    // Get user details from blockchain
    async getUserDetails(walletAddress) {
        const contract = this.getReadOnlyContract('identity');
        const user = await contract.getUser(walletAddress);
        return {
            identityHash: user.identityHash,
            walletAddress: user.walletAddress,
            isRegistered: user.isRegistered,
            registeredAt: new Date(Number(user.registeredAt) * 1000),
        };
    }

    // Get total user count
    async getTotalUsers() {
        const contract = this.getReadOnlyContract('identity');
        return Number(await contract.getUserCount());
    }

    // Get total verifier count
    async getTotalVerifiers() {
        const contract = this.getReadOnlyContract('identity');
        return Number(await contract.getVerifierCount());
    }

    // ========== RECYCLE RECORD CONTRACT FUNCTIONS ==========

    // Record recycling on blockchain
    async recordRecyclingOnChain(userWallet, verifierWallet, category, weightInGrams, ipfsHash) {
        await this.initialize();
        const categoryIndex = typeof category === 'string' ? WASTE_CATEGORIES[category] : category;

        const tx = await this.contracts.recycleRecord.recordRecycling(
            userWallet,
            verifierWallet,
            categoryIndex,
            weightInGrams,
            ipfsHash || ''
        );
        const receipt = await tx.wait();

        // Parse the RecyclingRecorded event to get the record ID
        const event = receipt.logs.find(log => {
            try {
                const parsed = this.contracts.recycleRecord.interface.parseLog(log);
                return parsed.name === 'RecyclingRecorded';
            } catch {
                return false;
            }
        });

        let recordId = 0;
        if (event) {
            const parsed = this.contracts.recycleRecord.interface.parseLog(event);
            recordId = Number(parsed.args.recordId);
        }

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            recordId,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    // Verify recycling on blockchain
    async verifyRecyclingOnChain(recordId) {
        await this.initialize();
        const tx = await this.contracts.recycleRecord.verifyRecycling(recordId);
        const receipt = await tx.wait();
        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    // Get recycling record from blockchain
    async getRecyclingRecord(recordId) {
        const contract = this.getReadOnlyContract('recycleRecord');
        const record = await contract.getRecord(recordId);
        return {
            recordId: Number(record.recordId),
            user: record.user,
            verifier: record.verifier,
            category: CATEGORY_NAMES[Number(record.category)],
            categoryIndex: Number(record.category),
            weight: Number(record.weight),
            ipfsHash: record.ipfsHash,
            timestamp: new Date(Number(record.timestamp) * 1000),
            verified: record.verified,
        };
    }

    // Get user's recycling records from blockchain
    async getUserRecords(walletAddress) {
        const contract = this.getReadOnlyContract('recycleRecord');
        const recordIds = await contract.getUserRecords(walletAddress);

        const records = [];
        for (const id of recordIds) {
            const record = await this.getRecyclingRecord(Number(id));
            records.push(record);
        }
        return records;
    }

    // Get total records on blockchain
    async getTotalRecords() {
        const contract = this.getReadOnlyContract('recycleRecord');
        return Number(await contract.getTotalRecords());
    }

    // ========== CARBON TOKEN FUNCTIONS ==========

    // Get token balance
    async getTokenBalance(walletAddress) {
        const contract = this.getReadOnlyContract('carbonToken');
        const balance = await contract.balanceOf(walletAddress);
        return Number(ethers.formatEther(balance));
    }

    // Get token details
    async getTokenDetails() {
        const contract = this.getReadOnlyContract('carbonToken');
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.totalSupply(),
        ]);
        return {
            name,
            symbol,
            decimals: Number(decimals),
            totalSupply: Number(ethers.formatEther(totalSupply)),
        };
    }

    // Transfer tokens
    async transferTokens(to, amount) {
        await this.initialize();
        const amountWei = ethers.parseEther(amount.toString());
        const tx = await this.contracts.carbonToken.transfer(to, amountWei);
        const receipt = await tx.wait();
        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    // Burn tokens
    async burnTokens(amount) {
        await this.initialize();
        const amountWei = ethers.parseEther(amount.toString());
        const tx = await this.contracts.carbonToken.burn(amountWei);
        const receipt = await tx.wait();
        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    // ========== REWARD ENGINE FUNCTIONS ==========

    // Calculate reward for a category and weight
    async calculateReward(category, weightInGrams) {
        const contract = this.getReadOnlyContract('rewardEngine');
        const categoryIndex = typeof category === 'string' ? WASTE_CATEGORIES[category] : category;
        const reward = await contract.calculateReward(categoryIndex, weightInGrams);
        return Number(ethers.formatEther(reward));
    }

    // Process reward for a verified record
    async processReward(recordId) {
        await this.initialize();
        const tx = await this.contracts.rewardEngine.processReward(recordId);
        const receipt = await tx.wait();

        // Parse the RewardMinted event
        const event = receipt.logs.find(log => {
            try {
                const parsed = this.contracts.rewardEngine.interface.parseLog(log);
                return parsed.name === 'RewardMinted';
            } catch {
                return false;
            }
        });

        let rewardAmount = 0;
        if (event) {
            const parsed = this.contracts.rewardEngine.interface.parseLog(event);
            rewardAmount = Number(ethers.formatEther(parsed.args.amount));
        }

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            rewardAmount,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    // Check if reward is claimed
    async isRewardClaimed(recordId) {
        const contract = this.getReadOnlyContract('rewardEngine');
        return await contract.isRewardClaimed(recordId);
    }

    // Get user's total rewards from blockchain
    async getUserTotalRewards(walletAddress) {
        const contract = this.getReadOnlyContract('rewardEngine');
        const rewards = await contract.getUserTotalRewards(walletAddress);
        return Number(ethers.formatEther(rewards));
    }

    // Get reward rates from contract
    async getRewardRates() {
        const contract = this.getReadOnlyContract('rewardEngine');
        const [plastic, paper, metal, ewaste, organic] = await contract.getRewardRates();
        return {
            Plastic: Number(ethers.formatEther(plastic)),
            Paper: Number(ethers.formatEther(paper)),
            Metal: Number(ethers.formatEther(metal)),
            EWaste: Number(ethers.formatEther(ewaste)),
            Organic: Number(ethers.formatEther(organic)),
        };
    }

    // ========== UTILITY FUNCTIONS ==========

    // Get connected wallet address
    async getWalletAddress() {
        await this.initialize();
        return await this.signer.getAddress();
    }

    // Get chain ID
    async getChainId() {
        await this.initialize();
        const network = await this.provider.getNetwork();
        return Number(network.chainId);
    }

    // Listen for events
    onEvent(contractName, eventName, callback) {
        const contract = this.getReadOnlyContract(contractName);
        contract.on(eventName, callback);
        return () => contract.off(eventName, callback);
    }

    // Format transaction hash for display
    formatTxHash(hash, length = 10) {
        if (!hash) return '';
        return `${hash.slice(0, length)}...${hash.slice(-length)}`;
    }

    // Get block explorer URL (for various networks)
    getExplorerUrl(txHash, chainId = 1337) {
        const explorers = {
            1: 'https://etherscan.io/tx/',
            137: 'https://polygonscan.com/tx/',
            80001: 'https://mumbai.polygonscan.com/tx/',
            1337: `http://localhost:8545/tx/`, // Local - no real explorer
        };
        return explorers[chainId] ? `${explorers[chainId]}${txHash}` : null;
    }
}

// Singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;
