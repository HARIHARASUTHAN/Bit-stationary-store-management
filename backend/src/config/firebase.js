import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../');

// Ensure backend .env is loaded whether run from repo root or backend/
const backendEnvPath = path.resolve(backendRoot, '.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config();
}

let db = null;
let auth = null;
let isFirebaseConnected = false;

function resolveServiceAccountPath(serviceAccountPath) {
  const candidatePaths = [];

  if (serviceAccountPath) {
    candidatePaths.push(
      path.resolve(serviceAccountPath),
      path.resolve(backendRoot, serviceAccountPath),
      path.resolve(process.cwd(), 'backend', serviceAccountPath)
    );
  }

  candidatePaths.push(
    '/etc/secrets/serviceAccountKey.json',
    path.resolve(backendRoot, 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'backend/serviceAccountKey.json'),
    path.resolve(process.cwd(), 'serviceAccountKey.json')
  );

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

try {
  let credential = null;
  const resolvedPath = resolveServiceAccountPath(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

  if (resolvedPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    credential = admin.credential.cert(serviceAccount);
    console.log(`[Firebase] Loading credentials from: ${resolvedPath}`);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      const serviceAccount = JSON.parse(rawKey);
      credential = admin.credential.cert(serviceAccount);
      console.log(`[Firebase] Loading credentials from FIREBASE_SERVICE_ACCOUNT_KEY env var (project: ${serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID})`);
    } catch (e) {
      console.error('[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string:', e.message);
    }
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
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
