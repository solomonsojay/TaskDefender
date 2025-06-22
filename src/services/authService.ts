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
  checkActionCode,
  reload
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export class AuthService {
  static async signUp(email: string, password: string, userData: Omit<User, 'id' | 'createdAt'>) {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });
      
      // Reload user to get updated profile
      await reload(firebaseUser);
      
      // Create user document in Firestore with minimal data
      // This ensures the user will go through onboarding to complete their profile
      const user: User = {
        ...userData,
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        createdAt: new Date(),
        // Intentionally leave workStyle and role undefined to trigger onboarding
        workStyle: undefined as any,
        role: undefined as any
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...user,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified,
        // These fields are intentionally undefined to trigger onboarding
        workStyle: null,
        role: null
      });
      
      console.log('New user created with incomplete profile to trigger onboarding');
      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update last login time
      try {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          lastLoginAt: serverTimestamp(),
          emailVerified: firebaseUser.emailVerified
        });
      } catch (updateError) {
        console.warn('Failed to update last login time:', updateError);
        // Don't fail the sign in for this
      }
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user = {
          ...userData,
          id: firebaseUser.uid,
          email: firebaseUser.email || userData.email,
          createdAt: userData.createdAt?.toDate() || new Date(),
          emailVerified: firebaseUser.emailVerified
        } as User;
        
        console.log('User signed in:', user);
        console.log('User workStyle:', user.workStyle, 'User role:', user.role);
        
        return user;
      } else {
        throw new Error('User data not found. Please contact support.');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}`,
        handleCodeInApp: false
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async confirmPasswordReset(oobCode: string, newPassword: string) {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async verifyPasswordResetCode(oobCode: string) {
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      return email;
    } catch (error: any) {
      console.error('Password reset code verification error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async handleAuthAction(mode: string, oobCode: string, continueUrl?: string) {
    try {
      switch (mode) {
        case 'resetPassword':
          const email = await verifyPasswordResetCode(auth, oobCode);
          return { mode, email, oobCode };
        
        case 'verifyEmail':
          await applyActionCode(auth, oobCode);
          // Update user's email verification status in Firestore
          if (auth.currentUser) {
            await reload(auth.currentUser);
            try {
              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                emailVerified: auth.currentUser.emailVerified
              });
            } catch (updateError) {
              console.warn('Failed to update email verification status:', updateError);
            }
          }
          return { mode, success: true };
        
        case 'recoverEmail':
          const info = await checkActionCode(auth, oobCode);
          return { mode, info };
        
        default:
          throw new Error('Invalid action mode');
      }
    } catch (error: any) {
      console.error('Auth action error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async signOut() {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }
  
  static async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    try {
      // Ensure we have the latest user data
      await reload(firebaseUser);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user = {
          ...userData,
          id: firebaseUser.uid,
          email: firebaseUser.email || userData.email,
          createdAt: userData.createdAt?.toDate() || new Date(),
          emailVerified: firebaseUser.emailVerified
        } as User;
        
        console.log('Current user loaded:', user);
        console.log('User needs onboarding?', !user.workStyle || !user.role);
        
        return user;
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
      
      // Convert dates to server timestamps for Firestore
      if (updateData.createdAt) {
        delete updateData.createdAt; // Don't update creation date
      }
      
      // Add update timestamp
      updateData.updatedAt = serverTimestamp() as any;
      
      console.log('Updating user with data:', updateData);
      
      await updateDoc(userRef, updateData);
      
      // Update Firebase Auth profile if name changed
      if (updates.name && auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: updates.name
          });
        } catch (profileError) {
          console.warn('Failed to update Firebase Auth profile:', profileError);
          // Don't fail the entire update for this
        }
      }
      
      console.log('User updated successfully');
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  }
  
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
  
  static async refreshUser() {
    if (auth.currentUser) {
      try {
        await reload(auth.currentUser);
        return await this.getCurrentUser();
      } catch (error) {
        console.error('Error refreshing user:', error);
        return null;
      }
    }
    return null;
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
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/invalid-action-code':
        return 'The action link is invalid or has expired.';
      case 'auth/expired-action-code':
        return 'The action link has expired. Please request a new one.';
      case 'auth/invalid-continue-uri':
        return 'Invalid redirect URL.';
      case 'auth/missing-continue-uri':
        return 'Missing redirect URL.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/requires-recent-login':
        return 'Please sign out and sign in again to perform this action.';
      default:
        console.error('Unhandled auth error:', errorCode);
        return 'An unexpected error occurred. Please try again.';
    }
  }
}