const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load contract addresses and ABIs
let contracts = null;
let provider = null;
let signer = null;

function initializeBlockchain() {
    try {
        // Load deployment info
        const deploymentPath = path.join(__dirname, '../../blockchain/deployments/contracts.json');

        if (!fs.existsSync(deploymentPath)) {
            console.warn('⚠️  Contract deployment file not found. Blockchain features disabled.');
            return false;
        }

        const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

        // Initialize provider
        provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');

        // Initialize signer (for contract interactions)
        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
        if (privateKey) {
            signer = new ethers.Wallet(privateKey, provider);
        }

        // Load contract ABIs
        const identityABI = require('../../blockchain/artifacts/contracts/IdentityContract.sol/IdentityContract.json').abi;
        const recycleRecordABI = require('../../blockchain/artifacts/contracts/RecycleRecordContract.sol/RecycleRecordContract.json').abi;
        const carbonTokenABI = require('../../blockchain/artifacts/contracts/CarbonToken.sol/CarbonToken.json').abi;
        const rewardEngineABI = require('../../blockchain/artifacts/contracts/RewardEngine.sol/RewardEngine.json').abi;

        // Initialize contract instances
        contracts = {
            identity: new ethers.Contract(deploymentData.contracts.IdentityContract, identityABI, signer || provider),
            recycleRecord: new ethers.Contract(deploymentData.contracts.RecycleRecordContract, recycleRecordABI, signer || provider),
            carbonToken: new ethers.Contract(deploymentData.contracts.CarbonToken, carbonTokenABI, signer || provider),
            rewardEngine: new ethers.Contract(deploymentData.contracts.RewardEngine, rewardEngineABI, signer || provider)
        };

        console.log('✅ Blockchain connection initialized');
        return true;
    } catch (error) {
        console.error('❌ Blockchain initialization error:', error.message);
        return false;
    }
}

// Initialize on module load
initializeBlockchain();

// Register user on blockchain
async function registerUserOnChain(identityHash, walletAddress) {
    if (!contracts || !signer) {
        throw new Error('Blockchain not initialized');
    }

    const hashBytes = ethers.encodeBytes32String(identityHash.substring(0, 31));
    const tx = await contracts.identity.registerUser(hashBytes, walletAddress);
    await tx.wait();

    return tx.hash;
}

// Register verifier on blockchain
async function registerVerifierOnChain(walletAddress, organization) {
    if (!contracts || !signer) {
        throw new Error('Blockchain not initialized');
    }

    const tx = await contracts.identity.registerVerifier(walletAddress, organization);
    await tx.wait();

    return tx.hash;
}

// Record recycling on blockchain
async function recordRecyclingOnChain(userWallet, verifierWallet, category, weightInGrams, ipfsHash) {
    if (!contracts || !signer) {
        throw new Error('Blockchain not initialized');
    }

    const tx = await contracts.recycleRecord.recordRecycling(
        userWallet,
        verifierWallet,
        category,
        weightInGrams,
        ipfsHash
    );

    const receipt = await tx.wait();

    // Get record ID from event
    const event = receipt.logs.find(log => {
        try {
            const parsed = contracts.recycleRecord.interface.parseLog(log);
            return parsed.name === 'RecyclingRecorded';
        } catch {
            return false;
        }
    });

    if (event) {
        const parsed = contracts.recycleRecord.interface.parseLog(event);
        return Number(parsed.args.recordId);
    }

    return 0;
}

// Verify recycling on blockchain
async function verifyRecyclingOnChain(recordId) {
    if (!contracts || !signer) {
        throw new Error('Blockchain not initialized');
    }

    const tx = await contracts.recycleRecord.verifyRecycling(recordId);
    await tx.wait();

    return tx.hash;
}

// Process reward on blockchain
async function processRewardOnChain(recordId) {
    if (!contracts || !signer) {
        throw new Error('Blockchain not initialized');
    }

    const tx = await contracts.rewardEngine.processReward(recordId);
    const receipt = await tx.wait();

    // Get reward amount from event
    const event = receipt.logs.find(log => {
        try {
            const parsed = contracts.rewardEngine.interface.parseLog(log);
            return parsed.name === 'RewardMinted';
        } catch {
            return false;
        }
    });

    if (event) {
        const parsed = contracts.rewardEngine.interface.parseLog(event);
        return Number(ethers.formatEther(parsed.args.amount));
    }

    return 0;
}

// Get token balance
async function getTokenBalance(walletAddress) {
    if (!contracts) {
        throw new Error('Blockchain not initialized');
    }

    const balance = await contracts.carbonToken.balanceOf(walletAddress);
    return Number(ethers.formatEther(balance));
}

// Get user's recycling records
async function getUserRecords(walletAddress) {
    if (!contracts) {
        throw new Error('Blockchain not initialized');
    }

    const recordIds = await contracts.recycleRecord.getUserRecords(walletAddress);
    const records = [];

    for (const id of recordIds) {
        const record = await contracts.recycleRecord.getRecord(id);
        records.push({
            recordId: Number(record.recordId),
            user: record.user,
            verifier: record.verifier,
            category: Number(record.category),
            weight: Number(record.weight),
            ipfsHash: record.ipfsHash,
            timestamp: Number(record.timestamp),
            verified: record.verified
        });
    }

    return records;
}

module.exports = {
    initializeBlockchain,
    registerUserOnChain,
    registerVerifierOnChain,
    recordRecyclingOnChain,
    verifyRecyclingOnChain,
    processRewardOnChain,
    getTokenBalance,
    getUserRecords,
    contracts,
    provider
};
