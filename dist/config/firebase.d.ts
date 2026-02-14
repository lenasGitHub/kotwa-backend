import admin from 'firebase-admin';
/**
 * Initialize Firebase Admin SDK
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
 * Or FIREBASE_* env vars for individual credentials
 */
export declare const initializeFirebase: () => boolean;
/**
 * Check if Firebase is initialized
 */
export declare const isFirebaseInitialized: () => boolean;
/**
 * Get Firebase Admin instance
 */
export declare const getFirebaseAdmin: () => typeof admin;
//# sourceMappingURL=firebase.d.ts.map