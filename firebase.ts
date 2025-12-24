import { initializeApp } from "firebase/app";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service and storage service
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };