const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');

// Support loading from an environment variable (for Railway)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        logger.info('Firebase Admin Initialized successfully from ENV');
    } catch (error) {
        logger.error(`Error initializing Firebase from ENV: ${error.message}`);
    }
} else {
    // Fallback to local file
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);

        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            logger.info('Firebase Admin Initialized successfully from file');
        } catch (error) {
            logger.error(`Error initializing Firebase Admin: ${error.message}`);
        }
    } else {
        logger.warn('WARNING: FIREBASE_SERVICE_ACCOUNT env var not set and serviceAccountKey.json not found in config/. Notifications will not work.');
    }
}

module.exports = admin;
