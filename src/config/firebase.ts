import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

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

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics;
let functions;

try {
  if (checkFirebaseAvailability()) {
    console.log('🔥 Initializing Firebase with Analytics');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    
    // Initialize Analytics only in production
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
    
    console.log('✅ Firebase initialized successfully');
  } else {
    console.log('🔧 Firebase disabled - missing configuration');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.log('🔧 Firebase disabled due to error - running in local mode');
}

export { auth, db, storage, analytics, functions };
export default app;