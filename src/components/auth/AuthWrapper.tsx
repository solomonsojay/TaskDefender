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
            
            // Check if user needs onboarding
            if (!userData.workStyle || !userData.role) {
              dispatch({ type: 'START_ONBOARDING' });
            } else {
              dispatch({ type: 'COMPLETE_ONBOARDING' });
            }
          } else if (mounted) {
            // Firebase user exists but no Firestore data
            console.warn('Firebase user exists but no Firestore data found');
            setAuthError('User data not found. Please sign in again.');
            setShowAuth(true);
          }
        } else {
          // User is signed out
          if (mounted) {
            setUser(null);
            setShowAuth(true);
            setAuthError(null);
            dispatch({ type: 'START_ONBOARDING' });
          }
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        if (mounted) {
          setAuthError('Authentication error. Please try again.');
          setShowAuth(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setUser, dispatch]);

  // Handle auth success
  const handleAuthSuccess = async () => {
    try {
      setLoading(true);
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setShowAuth(false);
        setAuthError(null);
        
        // Check if user needs onboarding
        if (!userData.workStyle || !userData.role) {
          dispatch({ type: 'START_ONBOARDING' });
        } else {
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

  // Show loading spinner while checking auth state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show auth flow if user is not authenticated or there's an error
  if (showAuth || !user) {
    return (
      <AuthFlow 
        onAuthSuccess={handleAuthSuccess}
        initialError={authError}
      />
    );
  }

  // User is authenticated, show the app
  return <>{children}</>;
};

export default AuthWrapper;