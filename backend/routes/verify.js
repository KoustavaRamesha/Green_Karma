const express = require('express');
const { getCertificate, verifyCertificateOnChain, contracts } = require('../utils/blockchain');
const { db } = require('../config/firebase');

const router = express.Router();

/**
 * Verify certificate authenticity on blockchain
 * This endpoint directly queries the blockchain to verify certificate data
 */
router.get('/certificate/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const tokenIdNum = parseInt(tokenId);

        if (isNaN(tokenIdNum)) {
            return res.status(400).json({ 
                error: 'Invalid token ID',
                tamperProof: false
            });
        }

        let blockchainCert = null;
        let blockchainVerified = false;
        let verificationDetails = {
            onChain: false,
            contractAddress: null,
            transactionHash: null,
            blockNumber: null,
            recipientAddress: null,
            certificateType: null,
            totalWeight: null,
            issuedAt: null
        };

        // Verify certificate directly on blockchain (true tamper-proof verification)
        const blockchainVerification = await verifyCertificateOnChain(tokenIdNum);
        
        if (blockchainVerification.verified && blockchainVerification.tamperProof) {
            blockchainVerified = true;
            blockchainCert = blockchainVerification.certificate;
            
            verificationDetails = {
                onChain: true,
                contractAddress: blockchainVerification.blockchainProof.contractAddress,
                tokenOwner: blockchainVerification.blockchainProof.tokenOwner,
                transactionHash: null, // Would need to fetch from events
                blockNumber: null,
                recipientAddress: blockchainCert.recipient,
                certificateType: blockchainCert.certificateType,
                totalWeight: blockchainCert.totalWeight,
                issuedAt: blockchainCert.issuedAt,
                category: blockchainCert.category,
                recipientName: blockchainCert.recipientName,
                tokenExists: blockchainVerification.blockchainProof.tokenExists
            };
        }

        // Also check Firestore for additional metadata
        let firestoreData = null;
        try {
            const notifications = await db.collection('notifications')
                .where('type', '==', 'certificate')
                .get();
            
            for (const doc of notifications.docs) {
                const data = doc.data();
                if (data.certificateData && 
                    (data.certificateData.tokenId === tokenIdNum || 
                     data.certificateData.tokenId?.toString() === tokenId)) {
                    firestoreData = {
                        ...data.certificateData,
                        notificationId: doc.id,
                        verifierName: data.certificateData.verifierName,
                        verifierWallet: data.certificateData.verifierWallet,
                        txHash: data.certificateData.txHash,
                        blockNumber: data.certificateData.blockNumber,
                        blockchainMinted: data.certificateData.blockchainMinted
                    };
                    break;
                }
            }
        } catch (firestoreError) {
            console.error('Firestore lookup error:', firestoreError.message);
        }

        // Determine verification status
        const isTamperProof = blockchainVerified;
        const hasBlockchainData = !!firestoreData?.txHash || blockchainVerified;

        // Merge blockchain and Firestore data
        const certificate = blockchainCert || firestoreData;
        if (firestoreData && blockchainCert) {
            // Merge: blockchain data is source of truth
            Object.assign(certificate, blockchainCert, {
                verifierName: firestoreData.verifierName,
                verifierWallet: firestoreData.verifierWallet,
                txHash: firestoreData.txHash || null,
                blockNumber: firestoreData.blockNumber || null
            });
        }

        if (!certificate) {
            return res.status(404).json({
                error: 'Certificate not found',
                tamperProof: false,
                verified: false
            });
        }

        res.json({
            verified: true,
            tamperProof: isTamperProof,
            hasBlockchainData,
            certificate: {
                ...certificate,
                tokenId: tokenIdNum
            },
            verificationDetails: {
                ...verificationDetails,
                transactionHash: firestoreData?.txHash || verificationDetails.transactionHash,
                blockNumber: firestoreData?.blockNumber || verificationDetails.blockNumber,
                firestoreMetadata: !!firestoreData,
                blockchainSource: blockchainVerified ? 'on-chain' : (firestoreData?.blockchainMinted ? 'firestore-record' : 'firestore-only')
            },
            verificationStatus: {
                blockchainVerified,
                hasTransactionHash: !!firestoreData?.txHash,
                hasBlockNumber: !!firestoreData?.blockNumber,
                isFullyTamperProof: blockchainVerified && !!firestoreData?.txHash,
                recommendation: blockchainVerified 
                    ? 'This certificate is stored on the blockchain and is tamper-proof.'
                    : (hasBlockchainData 
                        ? 'Certificate has blockchain transaction record. Full verification pending blockchain sync.'
                        : 'Certificate exists but is not yet on blockchain. It may be pending or created as fallback.')
            }
        });
    } catch (error) {
        console.error('Certificate verification error:', error);
        res.status(500).json({
            error: 'Failed to verify certificate',
            tamperProof: false,
            verified: false,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;

