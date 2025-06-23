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
  reload,
  sendEmailVerification as firebaseSendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, checkFirebaseAvailability } from '../config/firebase';
import { User } from '../types';

export class AuthService {
  // Check if Firebase is available and working
  private static isFirebaseAvailable(): boolean {
    try {
      return checkFirebaseAvailability();
    } catch (error) {
      console.warn('Firebase availability check failed:', error);
      return false;
    }
  }

  // Fallback user management using localStorage
  private static getLocalUser(): User | null {
    try {
      const userData = localStorage.getItem('taskdefender_current_user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          ...user,
          createdAt: new Date(user.createdAt)
        };
      }
    } catch (error) {
      console.error('Error loading local user:', error);
    }
    return null;
  }

  private static setLocalUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem('taskdefender_current_user', JSON.stringify(user));
        console.log('✅ User saved to localStorage');
      } else {
        localStorage.removeItem('taskdefender_current_user');
        console.log('✅ User removed from localStorage');
      }
    } catch (error) {
      console.error('Error saving local user:', error);
    }
  }

  static async signUp(email: string, password: string, userData: Omit<User, 'id' | 'createdAt'>) {
    // Always try Firebase first, then fallback to localStorage
    if (this.isFirebaseAvailable()) {
      try {
        console.log('🔥 Attempting Firebase sign up...');
        
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Update Firebase Auth profile
        await updateProfile(firebaseUser, {
          displayName: userData.name
        });
        
        // Reload user to get updated profile
        await reload(firebaseUser);
        
        // Create user document in Firestore
        const user: User = {
          ...userData,
          id: firebaseUser.uid,
          email: firebaseUser.email || email,
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...user,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          emailVerified: firebaseUser.emailVerified
        });
        
        // Also save to localStorage as backup
        this.setLocalUser(user);
        
        console.log('✅ Firebase sign up successful');
        return user;
      } catch (error: any) {
        console.error('❌ Firebase sign up error:', error);
        console.warn('⚠️ Falling back to localStorage for user creation');
      }
    }
    
    // Fallback to localStorage
    console.log('📱 Using localStorage fallback for sign up');
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      email: email.toLowerCase(),
      createdAt: new Date()
    };
    this.setLocalUser(user);
    return user;
  }

  static async sendEmailVerification() {
    if (!this.isFirebaseAvailable()) {
      console.warn('Firebase not available, email verification not supported in fallback mode');
      throw new Error('Email verification is not available in offline mode. Please try again when connected.');
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await firebaseSendEmailVerification(user, {
        url: `${window.location.origin}`,
        handleCodeInApp: false
      });
      
      console.log('✅ Email verification sent');
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  static async verifyEmailWithCode(oobCode: string) {
    if (!this.isFirebaseAvailable()) {
      throw new Error('Email verification is not available in offline mode.');
    }

    try {
      await applyActionCode(auth, oobCode);
      
      // Reload the current user to get updated email verification status
      if (auth.currentUser) {
        await reload(auth.currentUser);
        
        // Update Firestore with verification status
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            emailVerified: auth.currentUser.emailVerified,
            emailVerifiedAt: serverTimestamp()
          });
        } catch (updateError) {
          console.warn('Failed to update email verification status in Firestore:', updateError);
        }
      }
      
      console.log('✅ Email verified successfully');
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async signIn(email: string, password: string) {
    // Always try Firebase first, then fallback to localStorage
    if (this.isFirebaseAvailable()) {
      try {
        console.log('🔥 Attempting Firebase sign in...');
        
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
          
          // Save to localStorage as backup
          this.setLocalUser(user);
          
          console.log('✅ Firebase sign in successful');
          return user;
        } else {
          throw new Error('User data not found in Firestore');
        }
      } catch (error: any) {
        console.error('❌ Firebase sign in error:', error);
        console.warn('⚠️ Falling back to localStorage for sign in');
      }
    }
    
    // Fallback to localStorage
    console.log('📱 Using localStorage fallback for sign in');
    const localUser = this.getLocalUser();
    if (localUser && localUser.email === email.toLowerCase()) {
      return localUser;
    }
    
    throw new Error('Invalid credentials or user not found');
  }
  
  static async resetPassword(email: string) {
    if (!this.isFirebaseAvailable()) {
      console.warn('Firebase not available, password reset not supported in fallback mode');
      throw new Error('Password reset is not available in offline mode. Please try again when connected.');
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}`,
        handleCodeInApp: false
      });
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async confirmPasswordReset(oobCode: string, newPassword: string) {
    if (!this.isFirebaseAvailable()) {
      throw new Error('Password reset confirmation is not available in offline mode.');
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      console.log('✅ Password reset confirmed');
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async verifyPasswordResetCode(oobCode: string) {
    if (!this.isFirebaseAvailable()) {
      throw new Error('Password reset verification is not available in offline mode.');
    }

    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      console.log('✅ Password reset code verified');
      return email;
    } catch (error: any) {
      console.error('Password reset code verification error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async handleAuthAction(mode: string, oobCode: string, continueUrl?: string) {
    if (!this.isFirebaseAvailable()) {
      throw new Error('Auth actions are not available in offline mode.');
    }

    try {
      switch (mode) {
        case 'resetPassword':
          const email = await verifyPasswordResetCode(auth, oobCode);
          return { mode, email, oobCode };
        
        case 'verifyEmail':
          await applyActionCode(auth, oobCode);
          if (auth.currentUser) {
            await reload(auth.currentUser);
            try {
              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                emailVerified: auth.currentUser.emailVerified,
                emailVerifiedAt: serverTimestamp()
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
      if (this.isFirebaseAvailable()) {
        await signOut(auth);
        console.log('✅ Firebase sign out successful');
      }
      // Always clear local storage
      this.setLocalUser(null);
      console.log('✅ User signed out');
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Still clear local storage even if Firebase fails
      this.setLocalUser(null);
    }
  }
  
  static async getCurrentUser(): Promise<User | null> {
    // Try Firebase first
    if (this.isFirebaseAvailable()) {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
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
            
            // Update localStorage backup
            this.setLocalUser(user);
            
            return user;
          }
        } catch (error) {
          console.error('Error getting current user from Firebase:', error);
        }
      }
    }
    
    // Fallback to localStorage
    return this.getLocalUser();
  }
  
  static async updateUser(userId: string, updates: Partial<User>) {
    // Try Firebase first
    if (this.isFirebaseAvailable()) {
      try {
        const userRef = doc(db, 'users', userId);
        const updateData = { ...updates };
        
        if (updateData.createdAt) {
          delete updateData.createdAt;
        }
        
        updateData.updatedAt = serverTimestamp() as any;
        
        await updateDoc(userRef, updateData);
        
        if (updates.name && auth.currentUser) {
          try {
            await updateProfile(auth.currentUser, {
              displayName: updates.name
            });
          } catch (profileError) {
            console.warn('Failed to update Firebase Auth profile:', profileError);
          }
        }
        
        console.log('✅ User updated in Firebase');
      } catch (error: any) {
        console.error('❌ Update user error in Firebase:', error);
        console.warn('⚠️ Falling back to localStorage update');
      }
    }
    
    // Always update localStorage (as backup or primary)
    const currentUser = this.getLocalUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      this.setLocalUser(updatedUser);
      console.log('✅ User updated in localStorage');
      return;
    }
    
    if (!this.isFirebaseAvailable()) {
      throw new Error('User not found in local storage');
    }
  }
  
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (this.isFirebaseAvailable()) {
      return onAuthStateChanged(auth, callback);
    }

    // For localStorage fallback, simulate auth state
    setTimeout(() => {
      const localUser = this.getLocalUser();
      callback(localUser ? { uid: localUser.id } as FirebaseUser : null);
    }, 100);
    
    // Return a dummy unsubscribe function
    return () => {};
  }
  
  static async refreshUser() {
    if (this.isFirebaseAvailable() && auth.currentUser) {
      try {
        await reload(auth.currentUser);
        return await this.getCurrentUser();
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
    return this.getLocalUser();
  }
  
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