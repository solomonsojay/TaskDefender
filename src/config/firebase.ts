import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAC6djce4x6qRKYbhEfoUps40NKm1ubQ-g",
  authDomain: "taskdefender-68cfd.firebaseapp.com",
  projectId: "taskdefender-68cfd",
  storageBucket: "taskdefender-68cfd.firebasestorage.app",
  messagingSenderId: "951571068570",
  appId: "1:951571068570:web:97bc8a4d84e754e0199123"
};

let app;
let auth;
let db;
let storage;
let isFirebaseAvailable = false;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Test Firebase connection
  const testConnection = async () => {
    try {
      // Simple test to verify Firebase is working
      await auth.authStateReady;
      isFirebaseAvailable = true;
      console.log('✅ Firebase initialized and connected successfully');
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

// Export Firebase availability checker
export const checkFirebaseAvailability = (): boolean => {
  return isFirebaseAvailable && auth !== undefined && db !== undefined;
};

// Export services with fallback handling
export { auth, db, storage };
export default app;