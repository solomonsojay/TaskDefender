import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  
  // Fallback for when Firebase is not available
  console.warn('⚠️ Firebase not available, using localStorage fallback');
}

export { auth, db, storage };
export default app;