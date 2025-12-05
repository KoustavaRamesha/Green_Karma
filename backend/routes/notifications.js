const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { db } = require('../config/firebase');
const { getUserCertificates, getCertificate } = require('../utils/blockchain');

const router = express.Router();

// Get user's notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', req.userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const notifications = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get user's blockchain certificates
router.get('/certificates', authMiddleware, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();

        // Get certificates from blockchain
        let blockchainCertificates = [];
        if (userData.walletAddress) {
            try {
                blockchainCertificates = await getUserCertificates(userData.walletAddress);
                // Convert blockchain certificates to ISO date strings for consistency
                blockchainCertificates = blockchainCertificates.map(cert => ({
                    ...cert,
                    issuedAt: cert.issuedAt instanceof Date ? cert.issuedAt.toISOString() : cert.issuedAt,
                    source: 'blockchain'
                }));
            } catch (bcError) {
                console.error('Blockchain certificate fetch error:', bcError);
            }
        }

        // Get certificate notifications from Firestore
        // Note: Sorting in memory to avoid composite index requirement
        let firestoreCertificates = [];
        try {
            const certNotifications = await db.collection('notifications')
                .where('userId', '==', req.userId)
                .where('type', '==', 'certificate')
                .get();

            firestoreCertificates = certNotifications.docs.map(doc => {
                const data = doc.data();
                const certData = data.certificateData || {};
                return {
                    id: doc.id,
                    ...certData,
                    notificationId: doc.id,
                    source: 'firestore',
                    createdAt: data.createdAt
                };
            });

            // Sort in memory by creation date (most recent first)
            firestoreCertificates.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.issuedAt || 0);
                const dateB = new Date(b.createdAt || b.issuedAt || 0);
                return dateB - dateA;
            });
        } catch (firestoreError) {
            console.error('Error fetching certificate notifications from Firestore:', firestoreError);
            // Continue with empty array - blockchain certificates might still work
        }

        // Merge certificates: prefer blockchain data, but include Firestore certificates
        // Create a map by tokenId to avoid duplicates
        const certificateMap = new Map();
        
        // First, add all blockchain certificates
        blockchainCertificates.forEach(cert => {
            if (cert.tokenId !== undefined && cert.tokenId !== null) {
                certificateMap.set(cert.tokenId.toString(), cert);
            }
        });

        // Then, add Firestore certificates (they may have more metadata like verifier info)
        firestoreCertificates.forEach(cert => {
            // Handle certificates with tokenId (including temporary ones)
            if (cert.tokenId !== undefined && cert.tokenId !== null) {
                const tokenIdKey = cert.tokenId.toString();
                const existing = certificateMap.get(tokenIdKey);
                if (existing) {
                    // Merge: blockchain data takes precedence for core fields, but keep Firestore metadata
                    certificateMap.set(tokenIdKey, {
                        ...existing,
                        ...cert,
                        // Preserve blockchain values for immutable fields
                        tokenId: existing.tokenId,
                        txHash: existing.txHash || cert.txHash,
                        blockNumber: existing.blockNumber || cert.blockNumber
                    });
                } else {
                    certificateMap.set(tokenIdKey, cert);
                }
            } else {
                // Firestore certificate without tokenId (temporary or pending)
                certificateMap.set(`firestore-${cert.id}`, cert);
            }
        });

        const allCertificates = Array.from(certificateMap.values())
            .sort((a, b) => {
                const dateA = new Date(a.issuedAt || 0);
                const dateB = new Date(b.issuedAt || 0);
                return dateB - dateA; // Most recent first
            });

        res.json({
            certificates: allCertificates,
            count: allCertificates.length
        });
    } catch (error) {
        console.error('Get certificates error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to fetch certificates',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get specific certificate by token ID
router.get('/certificates/:tokenId', authMiddleware, async (req, res) => {
    try {
        const { tokenId } = req.params;
        const certificate = await getCertificate(parseInt(tokenId));
        res.json({ certificate });
    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({ error: 'Failed to fetch certificate' });
    }
});

// Mark notification as read
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notificationRef = db.collection('notifications').doc(notificationId);
        const notificationDoc = await notificationRef.get();

        if (!notificationDoc.exists) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notificationDoc.data().userId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await notificationRef.update({ read: true });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Get unread notification count
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const unreadSnapshot = await db.collection('notifications')
            .where('userId', '==', req.userId)
            .where('read', '==', false)
            .get();

        res.json({ count: unreadSnapshot.size });
    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

// Mark all notifications as read
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        const unreadSnapshot = await db.collection('notifications')
            .where('userId', '==', req.userId)
            .where('read', '==', false)
            .get();

        const batch = db.batch();
        unreadSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();

        res.json({ message: 'All notifications marked as read', count: unreadSnapshot.size });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

module.exports = router;
