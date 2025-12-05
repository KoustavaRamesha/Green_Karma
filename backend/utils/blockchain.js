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

        // Load GreenCertificate if deployed
        try {
            if (deploymentData.contracts.GreenCertificate) {
                const certificateABI = require('../../blockchain/artifacts/contracts/GreenCertificate.sol/GreenCertificate.json').abi;
                contracts.certificate = new ethers.Contract(deploymentData.contracts.GreenCertificate, certificateABI, signer || provider);
                console.log('✅ GreenCertificate contract loaded');
            }
        } catch (certError) {
            console.warn('⚠️  GreenCertificate contract not available:', certError.message);
        }

        console.log('✅ Blockchain connection initialized');
        return true;
    } catch (error) {
        console.error('❌ Blockchain initialization error:', error.message);
        return false;
    }
}

// Initialize on module load
initializeBlockchain();

// Check if user is registered on blockchain
async function isUserRegisteredOnChain(walletAddress) {
    if (!contracts) {
        return false;
    }
    try {
        return await contracts.identity.isUser(walletAddress);
    } catch (error) {
        console.error('Error checking user registration:', error);
        return false;
    }
}

// Check if verifier is registered on blockchain
async function isVerifierRegisteredOnChain(walletAddress) {
    if (!contracts) {
        return false;
    }
    try {
        return await contracts.identity.isVerifier(walletAddress);
    } catch (error) {
        console.error('Error checking verifier registration:', error);
        return false;
    }
}

// Register user on blockchain (with check to avoid duplicates)
async function registerUserOnChain(identityHash, walletAddress) {
    if (!contracts || !signer) {
        throw new Error('Blockchain not initialized');
    }

    // Check if already registered
    const isRegistered = await isUserRegisteredOnChain(walletAddress);
    if (isRegistered) {
        console.log('User already registered on blockchain:', walletAddress);
        return 'already-registered';
    }

    const hashBytes = ethers.encodeBytes32String(identityHash.substring(0, 31));
    const tx = await contracts.identity.registerUser(hashBytes, walletAddress);
    await tx.wait();
    console.log('✅ User registered on blockchain:', walletAddress, 'TX:', tx.hash);

    return tx.hash;
}

// Register verifier on blockchain (with check to avoid duplicates)
async function registerVerifierOnChain(walletAddress, organization) {
    if (!contracts || !signer) {
        throw new Error('Blockchain not initialized');
    }

    // Check if already registered
    const isRegistered = await isVerifierRegisteredOnChain(walletAddress);
    if (isRegistered) {
        console.log('Verifier already registered on blockchain:', walletAddress);
        return 'already-registered';
    }

    const tx = await contracts.identity.registerVerifier(walletAddress, organization);
    await tx.wait();
    console.log('✅ Verifier registered on blockchain:', walletAddress, 'TX:', tx.hash);

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

// Certificate threshold in grams (40kg)
const CERTIFICATE_THRESHOLD = 40000;

// Mint certificate for large donors
async function mintCertificate(recipientAddress, recipientName, totalWeightGrams, category, metadataURI) {
    if (!contracts || !contracts.certificate || !signer) {
        throw new Error('Certificate contract not initialized');
    }

    if (totalWeightGrams < CERTIFICATE_THRESHOLD) {
        throw new Error('Weight must be at least 40kg for certificate');
    }

    const tx = await contracts.certificate.mintCertificate(
        recipientAddress,
        recipientName,
        totalWeightGrams,
        category,
        metadataURI || ''
    );
    const receipt = await tx.wait();

    // Parse the CertificateMinted event
    const event = receipt.logs.find(log => {
        try {
            const parsed = contracts.certificate.interface.parseLog(log);
            return parsed.name === 'CertificateMinted';
        } catch {
            return false;
        }
    });

    let tokenId = 0;
    let certificateType = 'BRONZE';
    if (event) {
        const parsed = contracts.certificate.interface.parseLog(event);
        tokenId = Number(parsed.args.tokenId);
        certificateType = parsed.args.certificateType;
    }

    console.log(`🏆 Certificate minted! Token ID: ${tokenId}, Type: ${certificateType}`);

    return {
        tokenId,
        certificateType,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
    };
}

// Get user's certificates
async function getUserCertificates(walletAddress) {
    if (!contracts || !contracts.certificate) {
        return [];
    }

    try {
        const tokenIds = await contracts.certificate.getUserCertificates(walletAddress);
        const certificates = [];

        for (const tokenId of tokenIds) {
            const cert = await contracts.certificate.getCertificate(tokenId);
            certificates.push({
                tokenId: Number(cert.tokenId),
                recipient: cert.recipient,
                recipientName: cert.recipientName,
                totalWeight: Number(cert.totalWeight),
                category: cert.category,
                issuedAt: new Date(Number(cert.issuedAt) * 1000),
                certificateType: cert.certificateType,
                ipfsMetadataHash: cert.ipfsMetadataHash
            });
        }

        return certificates;
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return [];
    }
}

// Get certificate by token ID
async function getCertificate(tokenId) {
    if (!contracts || !contracts.certificate) {
        throw new Error('Certificate contract not initialized');
    }

    const cert = await contracts.certificate.getCertificate(tokenId);
    return {
        tokenId: Number(cert.tokenId),
        recipient: cert.recipient,
        recipientName: cert.recipientName,
        totalWeight: Number(cert.totalWeight),
        category: cert.category,
        issuedAt: new Date(Number(cert.issuedAt) * 1000),
        certificateType: cert.certificateType,
        ipfsMetadataHash: cert.ipfsMetadataHash
    };
}

// Check certificate eligibility
async function checkCertificateEligibility(totalWeightGrams) {
    if (totalWeightGrams < CERTIFICATE_THRESHOLD) {
        return { eligible: false, certificateType: null };
    }

    let certificateType = 'BRONZE';
    if (totalWeightGrams >= 1000000) {
        certificateType = 'PLATINUM';
    } else if (totalWeightGrams >= 500000) {
        certificateType = 'GOLD';
    } else if (totalWeightGrams >= 100000) {
        certificateType = 'SILVER';
    }

    return { eligible: true, certificateType };
}

// Get total certificates issued
async function getTotalCertificates() {
    if (!contracts || !contracts.certificate) {
        return 0;
    }
    return Number(await contracts.certificate.getTotalCertificates());
}

// Verify certificate authenticity on blockchain
// This directly queries the blockchain to verify certificate data is tamper-proof
async function verifyCertificateOnChain(tokenId) {
    if (!contracts || !contracts.certificate) {
        return {
            verified: false,
            tamperProof: false,
            error: 'Certificate contract not initialized'
        };
    }

    try {
        // Get certificate data directly from blockchain
        const cert = await contracts.certificate.getCertificate(tokenId);
        
        // Get contract address
        const contractAddress = await contracts.certificate.getAddress();
        
        // Get owner of the NFT token
        const owner = await contracts.certificate.ownerOf(tokenId);
        
        // Verify NFT exists
        const exists = await contracts.certificate.tokenURI(tokenId).catch(() => null);
        
        return {
            verified: true,
            tamperProof: true,
            certificate: {
                tokenId: Number(cert.tokenId),
                recipient: cert.recipient,
                recipientName: cert.recipientName,
                totalWeight: Number(cert.totalWeight),
                category: cert.category,
                issuedAt: new Date(Number(cert.issuedAt) * 1000),
                certificateType: cert.certificateType,
                ipfsMetadataHash: cert.ipfsMetadataHash
            },
            blockchainProof: {
                contractAddress,
                tokenOwner: owner,
                tokenExists: !!exists,
                blockTimestamp: Number(cert.issuedAt),
                onChain: true
            }
        };
    } catch (error) {
        return {
            verified: false,
            tamperProof: false,
            error: error.message,
            onChain: false
        };
    }
}

module.exports = {
    initializeBlockchain,
    isUserRegisteredOnChain,
    isVerifierRegisteredOnChain,
    registerUserOnChain,
    registerVerifierOnChain,
    recordRecyclingOnChain,
    verifyRecyclingOnChain,
    processRewardOnChain,
    getTokenBalance,
    getUserRecords,
    // Certificate functions
    mintCertificate,
    getUserCertificates,
    getCertificate,
    checkCertificateEligibility,
    getTotalCertificates,
    verifyCertificateOnChain,
    CERTIFICATE_THRESHOLD,
    contracts,
    provider
};
