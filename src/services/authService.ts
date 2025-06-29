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
  applyActionCode,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  collection, 
  getDocs 
} from 'firebase/firestore';

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
        const userToSave = {
          ...user,
          workStyle: user.workStyle || null
        };
        
        if (userToSave.workStyle) {
          const validation = validateUserData(userToSave);
          if (!validation.isValid) {
            console.warn('User data validation warnings:', validation.errors);
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

  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      if (checkFirebaseAvailability() && db) {
        // Query Firestore to check if email exists
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
      } else {
        const localUser = this.getLocalUser();
        return localUser?.email === email.toLowerCase().trim();
      }
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  static async signUp(email: string, password: string, userData: Omit<User, 'id' | 'createdAt'>) {
    try {
      // Validate input
      if (!email || !password || password.length < 6) {
        throw new Error('Email and password (min 6 characters) are required');
      }
      
      // Check if email already exists
      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        throw new Error('Email already in use. Please sign in or use a different email.');
      }
      
      if (checkFirebaseAvailability() && auth && db) {
        console.log('🔥 Creating Firebase account...');
        
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Update Firebase Auth profile
        await updateProfile(firebaseUser, {
          displayName: userData.name
        });
        
        // Send email verification
        await sendEmailVerification(firebaseUser, {
          url: `${window.location.origin}/auth/verify-email`,
          handleCodeInApp: true
        });
        
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
        
        console.log('✅ Firebase account created successfully');
        console.log('📧 Email verification sent to:', email);
        
        return user;
      } else {
        console.log('📱 Creating TaskDefender account locally...');
        
        const user: User = {
          ...userData,
          id: generateSecureId(),
          email: email.toLowerCase().trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: true,
          integrityScore: userData.integrityScore || 100,
          streak: userData.streak || 0,
          workStyle: null
        };
        
        this.setLocalUser(user);
        return user;
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use. Please sign in or use a different email.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      }
      
      throw error;
    }
  }
  
  static async signIn(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (checkFirebaseAvailability() && auth && db) {
        console.log('🔥 Signing into Firebase...');
        
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as any;
          
          // Convert date strings to Date objects
          const user: User = {
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
            workStyle: userData.workStyle || null,
            emailVerified: firebaseUser.emailVerified
          };
          
          // Also save to localStorage as backup
          this.setLocalUser(user);
          
          console.log('✅ Firebase sign in successful');
          return user;
        } else {
          throw new Error('User data not found');
        }
      } else {
        console.log('📱 Signing into TaskDefender locally...');
        
        // Check if user exists
        const localUser = this.getLocalUser();
        if (localUser && localUser.email === email.toLowerCase().trim()) {
          const userToReturn = {
            ...localUser,
            workStyle: localUser.workStyle || null
          };
          
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
          workStyle: null,
          integrityScore: 100,
          streak: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: true
        };
        
        this.setLocalUser(newUser);
        return newUser;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.');
      }
      
      throw error;
    }
  }
  
  static async resetPassword(email: string) {
    if (checkFirebaseAvailability() && auth) {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/reset-password`,
        handleCodeInApp: true
      });
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
  
  static async verifyEmail(oobCode: string) {
    if (checkFirebaseAvailability() && auth) {
      await applyActionCode(auth, oobCode);
      console.log('✅ Email verified successfully');
      
      // Update user document in Firestore
      if (auth.currentUser && db) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          emailVerified: true,
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      console.log('✅ Email verification skipped in local mode');
    }
  }
  
  static async resendEmailVerification() {
    if (checkFirebaseAvailability() && auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: true
      });
      console.log('📧 Email verification resent');
    } else {
      throw new Error('Email verification is not available in local mode.');
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
          const userData = userDoc.data() as any;
          
          // Convert date strings to Date objects
          return {
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
            workStyle: userData.workStyle || null,
            emailVerified: auth.currentUser.emailVerified
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
      return onAuthStateChanged(auth, callback);
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
          const userData = userDoc.data() as any;
          
          // Convert date strings to Date objects
          const user = {
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
            workStyle: userData.workStyle || null,
            emailVerified: auth.currentUser.emailVerified
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

  static async validateSession(): Promise<boolean> {
    try {
      if (checkFirebaseAvailability() && auth) {
        return !!auth.currentUser;
      } else {
        const user = this.getLocalUser();
        if (!user) return false;
        return true;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
}