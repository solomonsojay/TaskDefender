import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, setUser, dispatch } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing local authentication...');
        
        // Check for existing local user
        const userData = localStorage.getItem('taskdefender_current_user');
        
        if (userData && mounted) {
          try {
            const localUser = JSON.parse(userData);
            const user = {
              ...localUser,
              createdAt: new Date(localUser.createdAt)
            };
            
            console.log('✅ Local user found:', user.email);
            setUser(user);
            
            // Check if user needs onboarding
            const needsOnboarding = !user.workStyle || 
                                   !user.role || 
                                   user.workStyle === null || 
                                   user.role === null ||
                                   user.workStyle === undefined ||
                                   user.role === undefined;
            
            if (needsOnboarding) {
              console.log('🎯 User needs onboarding - missing or null workStyle/role');
              dispatch({ type: 'START_ONBOARDING' });
            } else {
              console.log('✅ User profile complete - skipping onboarding');
              dispatch({ type: 'COMPLETE_ONBOARDING' });
            }
          } catch (error) {
            console.error('Error parsing local user data:', error);
            // Create a default user for testing
            createDefaultUser();
          }
        } else if (mounted) {
          // Create a default user for testing
          createDefaultUser();
        }
      } catch (error: any) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          createDefaultUser();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const createDefaultUser = () => {
      console.log('🎯 Creating default test user...');
      const defaultUser = {
        id: 'test-user-' + Date.now(),
        name: 'Test User',
        email: 'test@taskdefender.com',
        username: 'testuser',
        role: 'user' as const,
        goals: [],
        workStyle: null as any, // This will trigger onboarding
        integrityScore: 100,
        streak: 0,
        createdAt: new Date(),
        emailVerified: true
      };
      
      setUser(defaultUser);
      localStorage.setItem('taskdefender_current_user', JSON.stringify(defaultUser));
      dispatch({ type: 'START_ONBOARDING' });
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [setUser, dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default AuthWrapper;