import admin from 'firebase-admin';
import { config } from './env';

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
 * Or FIREBASE_* env vars for individual credentials
 */
export const initializeFirebase = (): boolean => {
    if (firebaseInitialized) {
        return true;
    }

    try {
        // Check for service account file path
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
            firebaseInitialized = true;
            console.log('🔥 Firebase initialized with service account file');
            return true;
        }

        // Check for individual credentials
        if (
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL &&
            process.env.FIREBASE_PRIVATE_KEY
        ) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Handle escaped newlines in private key
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            firebaseInitialized = true;
            console.log('🔥 Firebase initialized with env credentials');
            return true;
        }

        console.warn('⚠️ Firebase not configured - push notifications disabled');
        return false;
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        return false;
    }
};

/**
 * Check if Firebase is initialized
 */
export const isFirebaseInitialized = (): boolean => {
    return firebaseInitialized;
};

/**
 * Get Firebase Admin instance
 */
export const getFirebaseAdmin = () => {
    if (!firebaseInitialized) {
        throw new Error('Firebase not initialized');
    }
    return admin;
};
