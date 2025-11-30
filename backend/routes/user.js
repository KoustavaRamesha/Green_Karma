const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { db, adminDb } = require('../config/firebase'); // use adminDb for reads
const { getTokenBalance } = require('../utils/blockchain');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userDoc = await adminDb.collection('users').doc(req.userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userDoc.data();
        delete userData.password;
        res.json({ user: { uid: req.userId, ...userData } });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get user's recycling history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const submissionsSnapshot = await adminDb.collection('wasteSubmissions')
            .where('userId', '==', req.userId)
            .get();

        // Sort in memory to avoid missing index error
        const docs = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const submissions = [];
        for (const submission of docs) {
            if (submission.verifierId) {
                const verifierDoc = await adminDb.collection('users').doc(submission.verifierId).get();
                if (verifierDoc.exists) {
                    submission.verifier = {
                        name: verifierDoc.data().name,
                        organization: verifierDoc.data().organization,
                    };
                }
            }
            submissions.push(submission);
        }
        const stats = {
            totalSubmissions: submissions.length,
            verified: submissions.filter(s => s.status === 'verified').length,
            pending: submissions.filter(s => s.status === 'pending').length,
            rejected: submissions.filter(s => s.status === 'rejected').length,
            totalWeight: submissions.filter(s => s.status === 'verified')
                .reduce((sum, s) => sum + (s.actualWeight || 0), 0),
            totalRewards: submissions.filter(s => s.status === 'verified')
                .reduce((sum, s) => sum + (s.rewardAmount || 0), 0),
        };
        res.json({
            history: submissions.map(sub => ({
                id: sub.id,
                category: sub.category,
                weight: sub.weight,
                actualWeight: sub.actualWeight,
                status: sub.status,
                rewardAmount: sub.rewardAmount,
                imageUrl: sub.imageUrl,
                verifier: sub.verifier,
                createdAt: sub.createdAt,
                verifiedAt: sub.verifiedAt,
            })),
            stats,
        });
    } catch (error) {
        console.error('Get history error details:', error);
        res.status(500).json({
            error: 'Failed to fetch history',
            details: error.message, // Include for debugging
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get token balance
router.get('/token-balance', authMiddleware, async (req, res) => {
    try {
        let balance = 0;
        // Fallback to Firestore using adminDb
        const userDoc = await adminDb.collection('users').doc(req.userId).get();
        const userData = userDoc.data();
        const totalEarned = userData.totalTokensEarned || 0;
        const totalSpent = userData.tokensSpent || 0;
        balance = totalEarned - totalSpent;

        res.json({ balance, walletAddress: req.user.walletAddress });
    } catch (error) {
        console.error('Get token balance error:', error);
        res.status(500).json({ error: 'Failed to fetch token balance' });
    }
});

// Get dashboard stats
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const userDoc = await adminDb.collection('users').doc(req.userId).get();
        const userData = userDoc.data();
        const submissionsSnapshot = await adminDb.collection('wasteSubmissions')
            .where('userId', '==', req.userId)
            .get();
        const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const stats = {
            totalTokens: userData.totalTokensEarned || 0,
            totalRecycled: userData.totalRecycled || 0,
            totalSubmissions: submissions.length,
            verifiedSubmissions: submissions.filter(s => s.status === 'verified').length,
            pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
            categoryBreakdown: {
                Plastic: 0,
                Paper: 0,
                Metal: 0,
                EWaste: 0,
                Organic: 0,
            },
            recentActivity: [],
        };
        submissions.forEach(sub => {
            if (sub.status === 'verified') {
                stats.categoryBreakdown[sub.category] = (stats.categoryBreakdown[sub.category] || 0) + (sub.actualWeight || sub.weight);
            }
        });
        stats.recentActivity = submissions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(sub => ({
                id: sub.id,
                category: sub.category,
                weight: sub.actualWeight || sub.weight,
                status: sub.status,
                reward: sub.rewardAmount || 0,
                date: sub.createdAt,
            }));
        res.json({ stats });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Redeem rewards
router.post('/redeem', authMiddleware, async (req, res) => {
    try {
        const { amount, rewardType, rewardId, rewardName } = req.body;

        if (!amount || !rewardType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const userRef = adminDb.collection('users').doc(req.userId);

        // Run as transaction to ensure atomicity
        await adminDb.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const totalEarned = userData.totalTokensEarned || 0;
            const totalSpent = userData.tokensSpent || 0;
            const currentBalance = totalEarned - totalSpent;

            if (currentBalance < amount) {
                throw new Error('Insufficient balance');
            }

            // Update user balance
            t.update(userRef, {
                tokensSpent: totalSpent + amount,
                updatedAt: new Date().toISOString()
            });

            // Create redemption record
            const redemptionRef = adminDb.collection('redemptions').doc();
            t.set(redemptionRef, {
                userId: req.userId,
                rewardType,
                rewardId: rewardId || null,
                rewardName: rewardName || rewardType,
                amount,
                status: 'completed', // Instant redemption for now
                createdAt: new Date().toISOString()
            });
        });

        res.json({
            message: 'Redemption successful',
            amount,
            rewardType
        });
    } catch (error) {
        console.error('Redeem error:', error);
        if (error.message === 'Insufficient balance') {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        res.status(500).json({ error: 'Failed to process redemption' });
    }
});

// Get redemption history
router.get('/redemptions', authMiddleware, async (req, res) => {
    try {
        const snapshot = await adminDb.collection('redemptions')
            .where('userId', '==', req.userId)
            .get();

        const redemptions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort in memory
        redemptions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ redemptions });
    } catch (error) {
        console.error('Get redemptions error:', error);
        res.status(500).json({ error: 'Failed to fetch redemptions' });
    }
});

module.exports = router;
