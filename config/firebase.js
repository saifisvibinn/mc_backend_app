const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    // Prefer local file if it exists (for local development)
    const serviceAccount = require(serviceAccountPath);
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        logger.info('Firebase Admin Initialized successfully from file');
    } catch (error) {
        logger.error(`Error initializing Firebase Admin: ${error.message}`);
    }
} else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Individual env vars (recommended for Railway — avoids JSON blob PEM issues)
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            })
        });
        logger.info('Firebase Admin Initialized successfully from ENV');
    } catch (error) {
        logger.error(`Error initializing Firebase from ENV: ${error.message}`);
    }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Fallback: JSON blob (legacy)
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        logger.info('Firebase Admin Initialized successfully from ENV JSON blob');
    } catch (error) {
        logger.error(`Error initializing Firebase from ENV: ${error.message}`);
    }
} else {
    logger.warn('WARNING: Firebase credentials not configured. Notifications will not work.');
}

module.exports = admin;
