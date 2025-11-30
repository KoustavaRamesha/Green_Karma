const express = require('express');
const { authMiddleware, verifierMiddleware } = require('../middleware/auth');
const { db } = require('../config/firebase');
const { recordRecyclingOnChain, processRewardOnChain } = require('../utils/blockchain');

const router = express.Router();

// Get pending verifications
router.get('/pending', authMiddleware, verifierMiddleware, async (req, res) => {
    try {
        const pendingSnapshot = await db.collection('wasteSubmissions')
            .where('status', '==', 'pending')
            .get();

        const submissions = [];

        for (const doc of pendingSnapshot.docs) {
            const data = doc.data();
            const userDoc = await db.collection('users').doc(data.userId).get();

            submissions.push({
                id: doc.id,
                user: userDoc.exists ? {
                    name: userDoc.data().name,
                    email: userDoc.data().email,
                    wallet: userDoc.data().walletAddress
                } : null,
                category: data.category,
                weight: data.weight,
                imageUrl: data.imageUrl,
                qrCode: data.qrCode,
                createdAt: data.createdAt
            });
        }

        // Sort in memory to avoid composite index requirement
        submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ submissions });
    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({ error: 'Failed to fetch pending verifications' });
    }
});

// Verify waste submission
router.post('/verify/:submissionId', authMiddleware, verifierMiddleware, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { actualWeight, approved } = req.body;

        const submissionRef = db.collection('wasteSubmissions').doc(submissionId);
        const submissionDoc = await submissionRef.get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = submissionDoc.data();

        if (submission.status !== 'pending') {
            return res.status(400).json({ error: 'Submission already processed' });
        }

        if (!approved) {
            await submissionRef.update({
                status: 'rejected',
                verifierId: req.userId,
                verifierWallet: req.user.walletAddress,
                verifiedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return res.json({ message: 'Submission rejected' });
        }

        // Update submission
        const updateData = {
            status: 'verified',
            verifierId: req.userId,
            verifierWallet: req.user.walletAddress,
            actualWeight: actualWeight || submission.weight,
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Map category to blockchain enum
        const categoryMap = {
            'Plastic': 0,
            'Paper': 1,
            'Metal': 2,
            'EWaste': 3,
            'Organic': 4
        };

        // Calculate rewards
        let rewardAmount = 0;
        const finalWeight = actualWeight || submission.weight;

        try {
            // Try blockchain first
            const recordId = await recordRecyclingOnChain(
                submission.userWallet,
                req.user.walletAddress,
                categoryMap[submission.category],
                Math.floor(finalWeight * 1000), // Convert kg to grams
                submission.ipfsHash || 'no-image'
            );

            updateData.blockchainRecordId = recordId;

            // Process reward on blockchain
            rewardAmount = await processRewardOnChain(recordId);

        } catch (blockchainError) {
            console.error('Blockchain error (using fallback reward calculation):', blockchainError);

            // Fallback: Calculate rewards manually based on category
            const rewardRates = {
                'Plastic': 5,      // 5 tokens per kg
                'Paper': 3,        // 3 tokens per kg
                'Metal': 4,        // 4 tokens per kg
                'EWaste': 12,      // 12 tokens per kg
                'Organic': 1       // 1 token per kg
            };

            rewardAmount = finalWeight * (rewardRates[submission.category] || 1);
            console.log(`Fallback reward calculated: ${rewardAmount} tokens for ${finalWeight}kg of ${submission.category}`);
        }

        // Always set reward data
        updateData.rewardAmount = rewardAmount;
        updateData.rewardClaimed = true;

        // Update user stats
        const userRef = db.collection('users').doc(submission.userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        await userRef.update({
            totalRecycled: (userData.totalRecycled || 0) + finalWeight,
            totalTokensEarned: (userData.totalTokensEarned || 0) + rewardAmount,
            updatedAt: new Date().toISOString()
        });

        await submissionRef.update(updateData);

        res.json({
            message: 'Submission verified successfully',
            submission: {
                id: submissionId,
                status: updateData.status,
                actualWeight: updateData.actualWeight,
                blockchainRecordId: updateData.blockchainRecordId,
                rewardAmount: updateData.rewardAmount
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify submission' });
    }
});

// Get verifier's verification history
router.get('/history', authMiddleware, verifierMiddleware, async (req, res) => {
    try {
        const historySnapshot = await db.collection('wasteSubmissions')
            .where('verifierId', '==', req.userId)
            .where('status', 'in', ['verified', 'rejected'])
            .get();

        const verifications = [];

        for (const doc of historySnapshot.docs) {
            const data = doc.data();
            const userDoc = await db.collection('users').doc(data.userId).get();

            verifications.push({
                id: doc.id,
                user: userDoc.exists ? {
                    name: userDoc.data().name,
                    email: userDoc.data().email
                } : null,
                category: data.category,
                weight: data.weight,
                actualWeight: data.actualWeight,
                status: data.status,
                rewardAmount: data.rewardAmount,
                verifiedAt: data.verifiedAt
            });
        }

        // Sort in memory to avoid composite index requirement
        verifications.sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt));

        res.json({ verifications });
    } catch (error) {
        console.error('Get verification history error:', error);
        res.status(500).json({ error: 'Failed to fetch verification history' });
    }
});

// Scan QR code
router.post('/scan-qr', authMiddleware, verifierMiddleware, async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({ error: 'QR data is required' });
        }

        // Handle both JSON objects and plain submission IDs
        let submissionId;
        try {
            const data = JSON.parse(qrData);
            submissionId = data.submissionId;
        } catch (e) {
            // If not JSON, treat as plain submission ID
            submissionId = qrData.trim();
        }

        if (!submissionId) {
            return res.status(400).json({ error: 'Invalid QR data format' });
        }

        const submissionDoc = await db.collection('wasteSubmissions').doc(submissionId).get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = submissionDoc.data();
        const userDoc = await db.collection('users').doc(submission.userId).get();

        res.json({
            submission: {
                id: submissionDoc.id,
                user: userDoc.exists ? {
                    name: userDoc.data().name,
                    email: userDoc.data().email,
                    wallet: userDoc.data().walletAddress
                } : null,
                category: submission.category,
                weight: submission.weight,
                imageUrl: submission.imageUrl,
                status: submission.status,
                createdAt: submission.createdAt
            }
        });
    } catch (error) {
        console.error('QR scan error:', error);
        res.status(500).json({ error: 'Failed to scan QR code' });
    }
});

module.exports = router;
