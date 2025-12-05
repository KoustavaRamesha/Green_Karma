const { admin, adminDb } = require('../config/firebase');

// Verify Firebase ID token using Admin SDK
async function verifyIdToken(idToken) {
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        return decoded; // contains uid, email, etc.
    } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid token');
    }
}

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }
        const token = authHeader.replace('Bearer ', '').trim();
        const firebaseUser = await verifyIdToken(token);
        const email = firebaseUser.email || firebaseUser.uid;
        const firebaseUid = email.replace(/[.@]/g, '_');
        const userDoc = await adminDb.collection('users').doc(firebaseUid).get();
        if (!userDoc.exists) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = { uid: firebaseUid, ...userDoc.data() };
        req.userId = firebaseUid;
        next();
    } catch (error) {
        console.error('Auth middleware error details:', error);
        res.status(401).json({
            error: 'Invalid authentication token',
            details: error.message
        });
    }
};

// Verifier middleware
const verifierMiddleware = async (req, res, next) => {
    try {
        if (req.user.role !== 'verifier' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Verifier role required.' });
        }
        next();
    } catch (error) {
        res.status(403).json({ error: 'Authorization failed' });
    }
};

// Admin middleware
const adminMiddleware = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }
        next();
    } catch (error) {
        res.status(403).json({ error: 'Authorization failed' });
    }
};

module.exports = { authMiddleware, verifierMiddleware, adminMiddleware };
