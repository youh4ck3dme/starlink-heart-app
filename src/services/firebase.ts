import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Helper to deduce project ID if not explicitly set
const projectId = process.env.FIREBASE_PROJECT_ID || 
                  (process.env.FIREBASE_AUTH_DOMAIN ? process.env.FIREBASE_AUTH_DOMAIN.split('.')[0] : undefined);

// Helper to deduce storage bucket if not explicitly set
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 
                      (projectId ? `${projectId}.appspot.com` : undefined);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

const app = isFirebaseConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;
const auth = app ? getAuth(app) : null;

export { app, auth, db, storage };