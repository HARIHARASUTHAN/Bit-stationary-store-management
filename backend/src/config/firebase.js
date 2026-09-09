import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let db = null;
let auth = null;
let isFirebaseConnected = false;

try {
  let credential = null;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath && fs.existsSync(path.resolve(serviceAccountPath))) {
    const resolvedPath = path.resolve(serviceAccountPath);
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    credential = admin.credential.cert(serviceAccount);
    console.log(`[Firebase] Loading credentials from: ${resolvedPath}`);
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    });
    console.log(`[Firebase] Loading credentials from environment variables for project: ${process.env.FIREBASE_PROJECT_ID}`);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = admin.credential.applicationDefault();
    console.log('[Firebase] Loading application default credentials');
  }

  if (credential) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    db = admin.firestore();
    auth = admin.auth();
    isFirebaseConnected = true;
    console.log('✅ [Firebase] Successfully connected to Firebase Admin & Cloud Firestore');
  } else {
    console.warn('⚠️  [Firebase Notice] No valid Firebase credentials found in backend/.env.');
    console.warn('ℹ️   Server is operating in Demo / In-Memory Mock Mode.');
    console.warn('ℹ️   To connect live Cloud Firestore, provide serviceAccountKey.json or set FIREBASE_PROJECT_ID in backend/.env');
  }
} catch (error) {
  console.error('❌ [Firebase Error] Failed to initialize Firebase Admin SDK:', error.message);
  console.warn('ℹ️   Falling back to Demo / In-Memory Mock Mode.');
}

export { admin, db, auth, isFirebaseConnected };
