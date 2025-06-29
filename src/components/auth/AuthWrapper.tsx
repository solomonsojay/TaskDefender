import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { AuthService } from '../../services/authService';
import { checkFirebaseAvailability } from '../../config/firebase';
import EmailVerificationRequired from './EmailVerificationRequired';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, setUser, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        // Check if Firebase is available
        if (checkFirebaseAvailability()) {
          // Set up Firebase auth state listener
          const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser && mounted) {
              try {
                // Get user data from Firestore
                const userData = await AuthService.getCurrentUser();
                
                if (userData) {
                  console.log('✅ User found:', userData.email);
                  
                  // Check if email verification is required
                  if (!userData.emailVerified && firebaseUser.email) {
                    console.log('📧 Email verification required');
                    setEmailVerificationRequired(true);
                    setLoading(false);
                    return;
                  }
                  
                  setUser(userData);
                  
                  // Check if user needs onboarding - only check for workStyle
                  const needsOnboarding = userData.workStyle === null || 
                                         userData.workStyle === undefined;
                  
                  if (needsOnboarding) {
                    console.log('🎯 User needs onboarding - missing workStyle');
                    dispatch({ type: 'START_ONBOARDING' });
                  } else {
                    console.log('✅ User profile complete - skipping onboarding');
                    dispatch({ type: 'COMPLETE_ONBOARDING' });
                  }
                } else {
                  setUser(null);
                }
              } catch (error) {
                console.error('Error getting user data:', error);
                setUser(null);
              }
            } else if (mounted) {
              // Check for local user if Firebase user not found
              const localUser = await AuthService.getCurrentUser();
              
              if (localUser && mounted) {
                console.log('✅ Local user found:', localUser.email);
                setUser(localUser);
                
                // Check if user needs onboarding
                const needsOnboarding = localUser.workStyle === null || 
                                       localUser.workStyle === undefined;
                
                if (needsOnboarding) {
                  console.log('🎯 User needs onboarding - missing workStyle');
                  dispatch({ type: 'START_ONBOARDING' });
                } else {
                  console.log('✅ User profile complete - skipping onboarding');
                  dispatch({ type: 'COMPLETE_ONBOARDING' });
                }
              } else if (mounted) {
                setUser(null);
              }
            }
            
            if (mounted) {
              setLoading(false);
            }
          });
          
          return () => {
            unsubscribe();
          };
        } else {
          // Local authentication
          const localUser = await AuthService.getCurrentUser();
          
          if (localUser && mounted) {
            console.log('✅ Local user found:', localUser.email);
            setUser(localUser);
            
            // Check if user needs onboarding
            const needsOnboarding = localUser.workStyle === null || 
                                   localUser.workStyle === undefined;
            
            if (needsOnboarding) {
              console.log('🎯 User needs onboarding - missing workStyle');
              dispatch({ type: 'START_ONBOARDING' });
            } else {
              console.log('✅ User profile complete - skipping onboarding');
              dispatch({ type: 'COMPLETE_ONBOARDING' });
            }
          } else if (mounted) {
            setUser(null);
          }
          
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (error: any) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [setUser, dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (emailVerificationRequired) {
    return <EmailVerificationRequired onBackToLogin={() => setEmailVerificationRequired(false)} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="max-w-md w-full">
          {authMode === 'login' ? (
            <LoginForm onToggleMode={() => setAuthMode('signup')} />
          ) : (
            <SignupForm onToggleMode={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;