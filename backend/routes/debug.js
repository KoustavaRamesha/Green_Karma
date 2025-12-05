const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { db } = require('../config/firebase');

const router = express.Router();

// Debug endpoint to check certificates for a user
router.get('/certificates/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all certificate notifications
        const certNotifications = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('type', '==', 'certificate')
            .get();

        const certificates = certNotifications.docs.map(doc => ({
            notificationId: doc.id,
            ...doc.data()
        }));

        // Get verified submissions that qualify for certificates
        const submissions = await db.collection('wasteSubmissions')
            .where('userId', '==', userId)
            .where('status', '==', 'verified')
            .get();

        const qualifyingSubmissions = submissions.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(sub => {
                const weight = sub.actualWeight || sub.weight || 0;
                return weight >= 40; // 40kg threshold
            });

        res.json({
            userId,
            certificateNotifications: certificates,
            certificateCount: certificates.length,
            qualifyingSubmissions: qualifyingSubmissions.map(sub => ({
                id: sub.id,
                weight: sub.actualWeight || sub.weight,
                category: sub.category,
                verifiedAt: sub.verifiedAt,
                hasCertificate: !!sub.certificateTokenId
            })),
            summary: {
                totalCertificates: certificates.length,
                totalQualifyingSubmissions: qualifyingSubmissions.length,
                submissionsWithCertificates: qualifyingSubmissions.filter(sub => sub.certificateTokenId).length
            }
        });
    } catch (error) {
        console.error('Debug certificates error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

