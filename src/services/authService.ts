import { User } from '../types';
import { generateSecureId, validateUserData } from '../utils/validation';

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
      const localUser = this.getLocalUser();
      return localUser?.email === email.toLowerCase().trim();
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
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
  
  static async signIn(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
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
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
  
  static async resetPassword(email: string) {
    console.log('📧 Password reset skipped in local mode');
    throw new Error('Password reset is not available in local mode.');
  }
  
  static async confirmPasswordReset(oobCode: string, newPassword: string) {
    throw new Error('Password reset confirmation is not available in local mode.');
  }
  
  static async verifyPasswordResetCode(oobCode: string) {
    throw new Error('Password reset verification is not available in local mode.');
  }
  
  static async verifyEmail(oobCode: string) {
    console.log('✅ Email verification skipped in local mode');
  }
  
  static async resendEmailVerification() {
    throw new Error('Email verification is not available in local mode.');
  }
  
  static async signOut() {
    try {
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
    return this.getLocalUser();
  }
  
  static async updateUser(userId: string, updates: Partial<User>) {
    try {
      const updatedFields = {
        ...updates,
        updatedAt: new Date()
      };
      
      // Update in localStorage
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
    setTimeout(() => {
      const localUser = this.getLocalUser();
      callback(localUser ? { uid: localUser.id } : null);
    }, 100);
    
    return () => {};
  }
  
  static async refreshUser() {
    return this.getLocalUser();
  }

  static async validateSession(): Promise<boolean> {
    try {
      const user = this.getLocalUser();
      if (!user) return false;
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
}