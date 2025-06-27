import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase is available
export const checkFirebaseAvailability = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId
  );
};

// Initialize Firebase conditionally
let app;
let auth;
let db;
let storage;

try {
  if (checkFirebaseAvailability()) {
    console.log('🔥 Initializing Firebase');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    console.log('🔧 Firebase disabled - running in local mode');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.log('🔧 Firebase disabled due to error - running in local mode');
}

export { auth, db, storage };
export default app;