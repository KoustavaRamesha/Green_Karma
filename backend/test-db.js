require('dotenv').config();
const { adminDb } = require('./config/firebase');

async function testConnection() {
    try {
        console.log('Testing Firestore connection...');
        if (!adminDb) {
            throw new Error('adminDb is not initialized');
        }

        const collections = await adminDb.listCollections();
        console.log('Connected! Collections:', collections.map(c => c.id));

        // Try to read users collection
        const snapshot = await adminDb.collection('users').limit(1).get();
        console.log('Successfully read users collection. Documents:', snapshot.size);

    } catch (error) {
        console.error('Connection test failed:', error);
    }
}

testConnection();
