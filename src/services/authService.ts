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
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined
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
        // Validate user data before saving
        const validation = validateUserData(user);
        if (!validation.isValid) {
          console.error('Invalid user data:', validation.errors);
          throw new Error(`Invalid user data: ${validation.errors.join(', ')}`);
        }
        
        localStorage.setItem('taskdefender_current_user', JSON.stringify(user));
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
      console.log('📱 Creating TaskDefender account locally...');
      
      // Validate input
      if (!email || !password || password.length < 6) {
        throw new Error('Email and password (min 6 characters) are required');
      }
      
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
        workStyle: null // This will trigger onboarding
      };
      
      this.setLocalUser(user);
      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async sendEmailVerification() {
    console.log('📧 Email verification skipped in local mode');
    // No-op in local mode
  }

  static async verifyEmailWithCode(oobCode: string) {
    console.log('✅ Email verification skipped in local mode');
    // No-op in local mode
  }
  
  static async signIn(email: string, password: string) {
    try {
      console.log('📱 Signing into TaskDefender locally...');
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // For demo purposes, we'll accept any email/password combination
      // In a real app, you would validate against stored credentials
      
      // Check if user exists
      const localUser = this.getLocalUser();
      if (localUser && localUser.email === email.toLowerCase().trim()) {
        return localUser;
      }
      
      // For demo, create a new user if not found
      const newUser: User = {
        id: generateSecureId(),
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        username: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''),
        role: 'user',
        goals: [],
        workStyle: null, // This will trigger onboarding
        integrityScore: 100,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true
      };
      
      this.setLocalUser(newUser);
      return newUser;
    } catch (error) {
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
  
  static async handleAuthAction(mode: string, oobCode: string, continueUrl?: string) {
    throw new Error('Auth actions are not available in local mode.');
  }
  
  static async signOut() {
    try {
      this.setLocalUser(null);
      console.log('✅ TaskDefender user signed out');
    } catch (error: any) {
      console.error('TaskDefender sign out error:', error);
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
      const currentUser = this.getLocalUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { 
          ...currentUser, 
          ...updates, 
          updatedAt: new Date() 
        };
        
        this.setLocalUser(updatedUser);
        console.log('✅ TaskDefender user updated in localStorage');
        return updatedUser;
      }
      
      throw new Error('User not found in local storage');
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

  // Additional utility methods
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const localUser = this.getLocalUser();
      return localUser?.email === email.toLowerCase().trim();
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  static async validateSession(): Promise<boolean> {
    try {
      const user = this.getLocalUser();
      if (!user) return false;
      
      // Validate user data integrity
      const validation = validateUserData(user);
      return validation.isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
}