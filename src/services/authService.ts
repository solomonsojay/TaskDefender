import { User } from '../types';
import { generateSecureId, validateUserData } from '../utils/validation';
import { auth, db, checkFirebaseAvailability } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export class AuthService {
  private static getLocalUser(): User | null {
    try {
      const userData = localStorage.getItem('taskdefender_current_user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
          // Ensure workStyle is properly set - default to null to trigger onboarding
          workStyle: user.workStyle || null
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
        // Ensure workStyle is properly set before validation
        const userToSave = {
          ...user,
          workStyle: user.workStyle || null
        };
        
        // Only validate if workStyle is set (not during initial signup)
        if (userToSave.workStyle) {
          const validation = validateUserData(userToSave);
          if (!validation.isValid) {
            console.warn('User data validation warnings:', validation.errors);
            // Don't throw error, just log warnings for existing users
          }
        }
        
        localStorage.setItem('taskdefender_current_user', JSON.stringify(userToSave));
        console.log('✅ User saved to localStorage');
      } else {
        localStorage.removeItem('taskdefender_current_user');
        console.log('✅ User removed from localStorage');
      }
    } catch (error) {
      console.error('Error saving local user:', error);
      throw error;
    }
  }

  static async signUp(email: string, password: string, userData: Omit<User, 'id' | 'createdAt'>) {
    try {
      // Validate input
      if (!email || !password || password.length < 6) {
        throw new Error('Email and password (min 6 characters) are required');
      }
      
      // Check if Firebase is available
      if (checkFirebaseAvailability() && auth && db) {
        console.log('🔥 Creating Firebase account...');
        
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Send email verification
        await sendEmailVerification(firebaseUser);
        
        // Create user document in Firestore
        const user: User = {
          ...userData,
          id: firebaseUser.uid,
          email: email.toLowerCase().trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: firebaseUser.emailVerified,
          integrityScore: userData.integrityScore || 100,
          streak: userData.streak || 0,
          workStyle: null // Always null for new users to trigger onboarding
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        });
        
        // Also save to localStorage as backup
        this.setLocalUser(user);
        
        return user;
      } else {
        console.log('📱 Creating TaskDefender account locally...');
        
        // Check if email already exists
        const existingUser = this.getLocalUser();
        if (existingUser && existingUser.email === email.toLowerCase().trim()) {
          throw new Error('Email already in use');
        }
        
        const user: User = {
          ...userData,
          id: generateSecureId(),
          email: email.toLowerCase().trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: true,
          integrityScore: userData.integrityScore || 100,
          streak: userData.streak || 0,
          workStyle: null // Always null for new users to trigger onboarding
        };
        
        this.setLocalUser(user);
        return user;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async sendEmailVerification() {
    if (checkFirebaseAvailability() && auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      console.log('📧 Email verification sent');
    } else {
      console.log('📧 Email verification skipped in local mode');
    }
  }

  static async verifyEmailWithCode(oobCode: string) {
    if (checkFirebaseAvailability() && auth) {
      await applyActionCode(auth, oobCode);
      console.log('✅ Email verified successfully');
    } else {
      console.log('✅ Email verification skipped in local mode');
    }
  }
  
  static async signIn(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Check if Firebase is available
      if (checkFirebaseAvailability() && auth && db) {
        console.log('🔥 Signing into Firebase...');
        
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          
          // Convert date strings to Date objects
          const user: User = {
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
            workStyle: userData.workStyle || null // Ensure it's null if not set
          };
          
          // Also save to localStorage as backup
          this.setLocalUser(user);
          
          return user;
        } else {
          throw new Error('User data not found');
        }
      } else {
        console.log('📱 Signing into TaskDefender locally...');
        
        // Check if user exists
        const localUser = this.getLocalUser();
        if (localUser && localUser.email === email.toLowerCase().trim()) {
          // Ensure workStyle is properly handled for existing users
          const userToReturn = {
            ...localUser,
            workStyle: localUser.workStyle || null // Ensure it's null if not set
          };
          
          // Update the stored user if workStyle was missing
          if (!localUser.workStyle) {
            this.setLocalUser(userToReturn);
          }
          
          return userToReturn;
        }
        
        // For demo, create a new user if not found
        const newUser: User = {
          id: generateSecureId(),
          name: email.split('@')[0],
          email: email.toLowerCase().trim(),
          username: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''),
          role: 'user',
          goals: [],
          workStyle: null, // Always null for new users to trigger onboarding
          integrityScore: 100,
          streak: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: true
        };
        
        this.setLocalUser(newUser);
        return newUser;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
  
  static async resetPassword(email: string) {
    if (checkFirebaseAvailability() && auth) {
      await sendPasswordResetEmail(auth, email);
      console.log('📧 Password reset email sent');
    } else {
      console.log('📧 Password reset skipped in local mode');
      throw new Error('Password reset is not available in local mode.');
    }
  }
  
  static async confirmPasswordReset(oobCode: string, newPassword: string) {
    if (checkFirebaseAvailability() && auth) {
      await confirmPasswordReset(auth, oobCode, newPassword);
      console.log('✅ Password reset successfully');
    } else {
      throw new Error('Password reset confirmation is not available in local mode.');
    }
  }
  
  static async verifyPasswordResetCode(oobCode: string) {
    if (checkFirebaseAvailability() && auth) {
      return await verifyPasswordResetCode(auth, oobCode);
    } else {
      throw new Error('Password reset verification is not available in local mode.');
    }
  }
  
  static async handleAuthAction(mode: string, oobCode: string, continueUrl?: string) {
    if (checkFirebaseAvailability() && auth) {
      switch (mode) {
        case 'resetPassword':
          return await verifyPasswordResetCode(auth, oobCode);
        case 'verifyEmail':
          return await applyActionCode(auth, oobCode);
        default:
          throw new Error(`Unsupported auth action mode: ${mode}`);
      }
    } else {
      throw new Error('Auth actions are not available in local mode.');
    }
  }
  
  static async signOut() {
    try {
      if (checkFirebaseAvailability() && auth) {
        await firebaseSignOut(auth);
        console.log('🔥 Signed out from Firebase');
      }
      
      this.setLocalUser(null);
      console.log('✅ TaskDefender user signed out');
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Force clear even on error
      try {
        localStorage.removeItem('taskdefender_current_user');
      } catch (clearError) {
        console.error('Failed to clear user data:', clearError);
      }
      throw error;
    }
  }
  
  static async getCurrentUser(): Promise<User | null> {
    if (checkFirebaseAvailability() && auth && db && auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          
          // Convert date strings to Date objects
          return {
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
            workStyle: userData.workStyle || null
          };
        }
      } catch (error) {
        console.error('Error getting current user from Firestore:', error);
      }
    }
    
    return this.getLocalUser();
  }
  
  static async updateUser(userId: string, updates: Partial<User>) {
    try {
      const updatedFields = {
        ...updates,
        updatedAt: new Date()
      };
      
      if (checkFirebaseAvailability() && db) {
        // Update in Firestore
        const userRef = doc(db, 'users', userId);
        
        // Convert dates to ISO strings for Firestore
        const firestoreUpdates = {
          ...updatedFields,
          updatedAt: updatedFields.updatedAt.toISOString()
        };
        
        await updateDoc(userRef, firestoreUpdates);
        console.log('✅ User updated in Firestore');
      }
      
      // Also update in localStorage
      const currentUser = this.getLocalUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { 
          ...currentUser, 
          ...updatedFields
        };
        
        this.setLocalUser(updatedUser);
        console.log('✅ User updated in localStorage');
        return updatedUser;
      }
      
      throw new Error('User not found');
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
  
  static onAuthStateChanged(callback: (user: any) => void) {
    if (checkFirebaseAvailability() && auth) {
      return auth.onAuthStateChanged(callback);
    } else {
      setTimeout(() => {
        const localUser = this.getLocalUser();
        callback(localUser ? { uid: localUser.id } : null);
      }, 100);
      
      return () => {};
    }
  }
  
  static async refreshUser() {
    if (checkFirebaseAvailability() && auth && db && auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          
          // Convert date strings to Date objects
          const user = {
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
            workStyle: userData.workStyle || null
          };
          
          // Update localStorage
          this.setLocalUser(user);
          
          return user;
        }
      } catch (error) {
        console.error('Error refreshing user from Firestore:', error);
      }
    }
    
    return this.getLocalUser();
  }

  // Additional utility methods
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      if (checkFirebaseAvailability() && db) {
        // In a real app, you would check Firestore or use Firebase Auth methods
        // This is a simplified implementation
        return false;
      } else {
        const localUser = this.getLocalUser();
        return localUser?.email === email.toLowerCase().trim();
      }
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  static async validateSession(): Promise<boolean> {
    try {
      if (checkFirebaseAvailability() && auth) {
        return !!auth.currentUser;
      } else {
        const user = this.getLocalUser();
        if (!user) return false;
        
        // Session is valid if user exists, regardless of workStyle
        return true;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
}