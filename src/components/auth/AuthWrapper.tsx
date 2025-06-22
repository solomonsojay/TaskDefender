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
  const { user, setUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userData = await AuthService.getCurrentUser();
          if (userData) {
            setUser(userData);
            setShowAuth(false);
          } else {
            setShowAuth(true);
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          setShowAuth(true);
        }
      } else {
        setUser(null);
        setShowAuth(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (showAuth || !user) {
    return <AuthFlow onAuthSuccess={() => setShowAuth(false)} />;
  }

  return <>{children}</>;
};

export default AuthWrapper;