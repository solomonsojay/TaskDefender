import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  checkActionCode
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
      throw new Error(this.getErrorMessage(error.code));
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
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/auth', // Redirect back to auth page after reset
        handleCodeInApp: false
      });
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async confirmPasswordReset(oobCode: string, newPassword: string) {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async verifyPasswordResetCode(oobCode: string) {
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      return email;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async handleAuthAction(mode: string, oobCode: string, continueUrl?: string) {
    try {
      switch (mode) {
        case 'resetPassword':
          // Verify the code is valid
          const email = await verifyPasswordResetCode(auth, oobCode);
          return { mode, email, oobCode };
        
        case 'verifyEmail':
          // Apply the email verification code
          await applyActionCode(auth, oobCode);
          return { mode, success: true };
        
        case 'recoverEmail':
          // Check the action code
          const info = await checkActionCode(auth, oobCode);
          return { mode, info };
        
        default:
          throw new Error('Invalid action mode');
      }
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
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
  
  // Helper method to convert Firebase error codes to user-friendly messages
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/invalid-action-code':
        return 'The password reset link is invalid or has expired.';
      case 'auth/expired-action-code':
        return 'The password reset link has expired. Please request a new one.';
      case 'auth/invalid-continue-uri':
        return 'Invalid redirect URL.';
      case 'auth/missing-continue-uri':
        return 'Missing redirect URL.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}