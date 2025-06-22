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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Only connect to emulators in development and if not already connected
if (process.env.NODE_ENV === 'development') {
  try {
    // Check if we're already connected to avoid multiple connections
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
  } catch (error) {
    // Emulator connection failed or already connected, continue with production
    console.log('Using production Firebase Auth');
  }

  try {
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    // Emulator connection failed or already connected, continue with production
    console.log('Using production Firestore');
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulator connection failed or already connected, continue with production
    console.log('Using production Storage');
  }
}

export default app;