const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const { db } = require('../config/firebase');
const { registerUserOnChain, registerVerifierOnChain } = require('../utils/blockchain');
const crypto = require('crypto');

const router = express.Router();

const FIREBASE_API_KEY = 'AIzaSyANqzbG3-13xc35__7cYTdI3NaaLmya6J4';

// Verify Firebase ID token using REST API
async function verifyIdToken(idToken) {
    try {
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            { idToken }
        );
        return response.data.users[0];
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Register new user (with Google Sign-In)
router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('name').trim().notEmpty(),
        body('walletAddress').trim().notEmpty()
    ],
    async (req, res) => {
        console.log('🔔 Register request payload:', req.body);
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, name, walletAddress, role, organization, photoURL } = req.body;
            const firebaseUid = email.replace(/[@.]/g, '_');

            // Check if user already exists by UID
            const userDoc = await db.collection('users').doc(firebaseUid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('User already exists in Firebase:', firebaseUid);

                // Ensure user is registered on blockchain even if already in Firebase
                try {
                    const userWallet = userData.walletAddress || walletAddress;
                    if (userWallet) {
                        const identityHash = crypto.createHash('sha256')
                            .update(`${userData.email}:${userData.name}:${Date.now()}`)
                            .digest('hex');

                        if (userData.role === 'verifier') {
                            await registerVerifierOnChain(userWallet, userData.organization || 'Government');
                        } else {
                            await registerUserOnChain(identityHash, userWallet);
                        }
                    }
                } catch (blockchainError) {
                    console.error('Blockchain registration for existing user error:', blockchainError.message);
                }

                return res.status(200).json({
                    message: 'User already registered',
                    user: {
                        uid: firebaseUid,
                        email: userData.email,
                        name: userData.name,
                        walletAddress: userData.walletAddress,
                        role: userData.role
                    }
                });
            }

            // Create identity hash
            const identityHash = crypto
                .createHash('sha256')
                .update(email + name + Date.now())
                .digest('hex');

            // Store user data in Firestore
            const userData = {
                email,
                name,
                walletAddress,
                identityHash,
                role: role || 'user',
                organization: organization || '',
                photoURL: photoURL || '',
                totalRecycled: 0,
                totalTokensEarned: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await db.collection('users').doc(firebaseUid).set(userData);

            // Register on blockchain (non‑critical)
            try {
                if (role === 'verifier') {
                    await registerVerifierOnChain(walletAddress, organization || 'Government');
                } else {
                    await registerUserOnChain(identityHash, walletAddress);
                }
            } catch (blockchainError) {
                console.error('Blockchain registration error:', blockchainError);
            }

            console.log('User registered successfully:', firebaseUid);
            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    uid: firebaseUid,
                    email,
                    name,
                    walletAddress,
                    role: userData.role
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: error.message || 'Registration failed' });
        }
    }
);

// Login (verify Firebase token and return user data)
router.post('/login',
    [
        body('idToken').notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { idToken } = req.body;
            const firebaseUser = await verifyIdToken(idToken);
            const email = firebaseUser.email;
            const firebaseUid = email.replace(/[@.]/g, '_');

            const userDoc = await db.collection('users').doc(firebaseUid).get();
            if (!userDoc.exists) {
                return res.status(401).json({
                    error: 'User not found. Please complete registration first.',
                    needsRegistration: true
                });
            }

            const userData = userDoc.data();
            res.json({
                message: 'Login successful',
                token: idToken,
                user: {
                    uid: firebaseUid,
                    email: userData.email,
                    name: userData.name,
                    walletAddress: userData.walletAddress,
                    role: userData.role,
                    photoURL: userData.photoURL || '',
                    totalTokensEarned: userData.totalTokensEarned || 0
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

module.exports = router;
