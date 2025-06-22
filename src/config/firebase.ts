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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;