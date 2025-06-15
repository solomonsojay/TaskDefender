import React from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import AuthForm from './AuthForm';
import LoadingSpinner from '../common/LoadingSpinner';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useSupabase();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
};

export default AuthWrapper;