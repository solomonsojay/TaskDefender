import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAC6djce4x6qRKYbhEfoUps40NKm1ubQ-g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "taskdefender-68cfd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "taskdefender-68cfd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "taskdefender-68cfd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "951571068570",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:951571068570:web:97bc8a4d84e754e0199123"
};

let app;
let auth;
let db;
let storage;
let isFirebaseAvailable = false;

try {
  console.log('🔥 Initializing Firebase with TaskDefender configuration...');
  app = initializeApp(firebaseConfig);
  
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  const testConnection = async () => {
    try {
      await auth.authStateReady;
      isFirebaseAvailable = true;
      console.log('✅ TaskDefender Firebase initialized successfully');
    } catch (error) {
      console.warn('⚠️ Firebase connection test failed:', error);
      isFirebaseAvailable = false;
    }
  };
  
  testConnection();
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.warn('⚠️ Firebase not available, using localStorage fallback');
  isFirebaseAvailable = false;
}

export const checkFirebaseAvailability = (): boolean => {
  try {
    return isFirebaseAvailable && auth !== undefined && db !== undefined;
  } catch (error) {
    console.warn('Firebase availability check failed:', error);
    return false;
  }
};

export { auth, db, storage };
export default app;