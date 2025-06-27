import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, setUser, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        // Check for existing local user
        const userData = localStorage.getItem('taskdefender_current_user');
        
        if (userData && mounted) {
          try {
            const localUser = JSON.parse(userData);
            const user = {
              ...localUser,
              createdAt: new Date(localUser.createdAt)
            };
            
            console.log('✅ User found:', user.email);
            setUser(user);
            
            // Check if user needs onboarding - only check for workStyle
            const needsOnboarding = !user.workStyle || 
                                   user.workStyle === null ||
                                   user.workStyle === undefined;
            
            if (needsOnboarding) {
              console.log('🎯 User needs onboarding - missing workStyle');
              dispatch({ type: 'START_ONBOARDING' });
            } else {
              console.log('✅ User profile complete - skipping onboarding');
              dispatch({ type: 'COMPLETE_ONBOARDING' });
            }
          } catch (error) {
            console.error('Error parsing local user data:', error);
            setUser(null);
          }
        } else if (mounted) {
          setUser(null);
        }
      } catch (error: any) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
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