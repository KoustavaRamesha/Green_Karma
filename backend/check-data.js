require('dotenv').config();
const { adminDb } = require('./config/firebase');

async function checkSubmissions() {
    try {
        console.log('Checking wasteSubmissions...');
        const snapshot = await adminDb.collection('wasteSubmissions').limit(1).get();
        if (snapshot.empty) {
            console.log('No submissions found.');
        } else {
            const doc = snapshot.docs[0].data();
            console.log('Sample submission:', JSON.stringify(doc, null, 2));
        }
    } catch (error) {
        console.error('Check failed:', error);
    }
}

checkSubmissions();
