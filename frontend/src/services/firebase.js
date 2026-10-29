// Firebase Authentication service
// Replace .env values with your actual Firebase project credentials
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    console.warn('⚠️ [Firebase Client] Failed to initialize:', err.message);
  }
} else {
  console.warn('⚠️ [Firebase Client] Firebase credentials are not yet configured in frontend/.env.');
}

// Safe onAuthStateChanged wrapper that avoids errors if auth is not yet initialized
const safeOnAuthStateChanged = (authInstance, callback) => {
  if (!authInstance) {
    // Call callback with null user immediately so AuthContext stops loading
    if (typeof callback === 'function') {
      setTimeout(() => callback(null), 0);
    }
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
};

export {
  app,
  auth,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  safeOnAuthStateChanged as onAuthStateChanged,
};

export default app;
