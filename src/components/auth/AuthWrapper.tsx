import React, { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../../services/authService';
import { useApp } from '../../context/AppContext';
import AuthFlow from './AuthFlow';
import LoadingSpinner from '../common/LoadingSpinner';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, setUser, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, try to get current user (works with both Firebase and localStorage)
        const currentUser = await AuthService.getCurrentUser();
        
        if (currentUser && mounted) {
          setUser(currentUser);
          setShowAuth(false);
          setAuthError(null);
          
          // Check if user needs onboarding
          const needsOnboarding = !currentUser.workStyle || !currentUser.role;
          
          if (needsOnboarding) {
            console.log('User needs onboarding - missing workStyle or role');
            dispatch({ type: 'START_ONBOARDING' });
          } else {
            dispatch({ type: 'COMPLETE_ONBOARDING' });
          }
        } else if (mounted) {
          // No user found
          setUser(null);
          setShowAuth(true);
          setAuthError(null);
          dispatch({ type: 'START_ONBOARDING' });
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthError('Authentication error. Please try again.');
          setShowAuth(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (!mounted) return;

      try {
        if (firebaseUser) {
          // User is signed in
          const userData = await AuthService.getCurrentUser();
          if (userData && mounted) {
            setUser(userData);
            setShowAuth(false);
            setAuthError(null);
            
            const needsOnboarding = !userData.workStyle || !userData.role;
            
            if (needsOnboarding) {
              dispatch({ type: 'START_ONBOARDING' });
            } else {
              dispatch({ type: 'COMPLETE_ONBOARDING' });
            }
          }
        } else {
          // User is signed out or no Firebase user
          if (mounted) {
            // Check localStorage fallback
            const localUser = await AuthService.getCurrentUser();
            if (localUser) {
              setUser(localUser);
              setShowAuth(false);
              
              const needsOnboarding = !localUser.workStyle || !localUser.role;
              if (needsOnboarding) {
                dispatch({ type: 'START_ONBOARDING' });
              } else {
                dispatch({ type: 'COMPLETE_ONBOARDING' });
              }
            } else {
              setUser(null);
              setShowAuth(true);
              setAuthError(null);
              dispatch({ type: 'START_ONBOARDING' });
            }
          }
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        if (mounted) {
          // Try localStorage fallback
          try {
            const localUser = await AuthService.getCurrentUser();
            if (localUser) {
              setUser(localUser);
              setShowAuth(false);
            } else {
              setAuthError('Authentication error. Please try again.');
              setShowAuth(true);
            }
          } catch (fallbackError) {
            setAuthError('Authentication error. Please try again.');
            setShowAuth(true);
          }
        }
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [setUser, dispatch]);

  const handleAuthSuccess = async () => {
    try {
      setLoading(true);
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setShowAuth(false);
        setAuthError(null);
        
        const needsOnboarding = !userData.workStyle || !userData.role;
        
        if (needsOnboarding) {
          console.log('New user or incomplete profile - starting onboarding');
          dispatch({ type: 'START_ONBOARDING' });
        } else {
          console.log('User has complete profile - skipping onboarding');
          dispatch({ type: 'COMPLETE_ONBOARDING' });
        }
      }
    } catch (error: any) {
      console.error('Auth success handler error:', error);
      setAuthError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (showAuth || !user) {
    return (
      <AuthFlow 
        onAuthSuccess={handleAuthSuccess}
        initialError={authError}
      />
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;