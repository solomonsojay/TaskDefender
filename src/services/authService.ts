import { User } from '../types';

export class AuthService {
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
    console.log('📱 Creating TaskDefender account locally...');
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      email: email.toLowerCase(),
      createdAt: new Date(),
      emailVerified: true
    };
    this.setLocalUser(user);
    return user;
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
    console.log('📱 Signing into TaskDefender locally...');
    const localUser = this.getLocalUser();
    if (localUser && localUser.email === email.toLowerCase()) {
      return localUser;
    }
    
    throw new Error('Invalid credentials or user not found');
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
      this.setLocalUser(null);
    }
  }
  
  static async getCurrentUser(): Promise<User | null> {
    return this.getLocalUser();
  }
  
  static async updateUser(userId: string, updates: Partial<User>) {
    const currentUser = this.getLocalUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates, updatedAt: new Date() };
      this.setLocalUser(updatedUser);
      console.log('✅ TaskDefender user updated in localStorage');
      return;
    }
    
    throw new Error('User not found in local storage');
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
}