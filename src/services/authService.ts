import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export class AuthService {
  static async signUp(email: string, password: string, userData: Omit<User, 'id' | 'createdAt'>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });
      
      // Create user document in Firestore
      const user: User = {
        ...userData,
        id: firebaseUser.uid,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...user,
        createdAt: user.createdAt.toISOString()
      });
      
      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          ...userData,
          id: firebaseUser.uid,
          createdAt: new Date(userData.createdAt)
        } as User;
      } else {
        throw new Error('User data not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  static async signOut() {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  static async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          ...userData,
          id: firebaseUser.uid,
          createdAt: new Date(userData.createdAt)
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  static async updateUser(userId: string, updates: Partial<User>) {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = { ...updates };
      
      // Convert dates to ISO strings for Firestore
      if (updateData.createdAt) {
        updateData.createdAt = updateData.createdAt.toISOString() as any;
      }
      
      await updateDoc(userRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}