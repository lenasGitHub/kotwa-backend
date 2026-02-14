"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseAdmin = exports.isFirebaseInitialized = exports.initializeFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
let firebaseInitialized = false;
/**
 * Initialize Firebase Admin SDK
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
 * Or FIREBASE_* env vars for individual credentials
 */
const initializeFirebase = () => {
    if (firebaseInitialized) {
        return true;
    }
    try {
        // Check for service account file path
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.applicationDefault(),
            });
            firebaseInitialized = true;
            console.log('🔥 Firebase initialized with service account file');
            return true;
        }
        // Check for individual credentials
        if (process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL &&
            process.env.FIREBASE_PRIVATE_KEY) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert({
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
    }
    catch (error) {
        console.error('Failed to initialize Firebase:', error);
        return false;
    }
};
exports.initializeFirebase = initializeFirebase;
/**
 * Check if Firebase is initialized
 */
const isFirebaseInitialized = () => {
    return firebaseInitialized;
};
exports.isFirebaseInitialized = isFirebaseInitialized;
/**
 * Get Firebase Admin instance
 */
const getFirebaseAdmin = () => {
    if (!firebaseInitialized) {
        throw new Error('Firebase not initialized');
    }
    return firebase_admin_1.default;
};
exports.getFirebaseAdmin = getFirebaseAdmin;
//# sourceMappingURL=firebase.js.map