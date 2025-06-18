import React from 'react';
import { useApp } from '../../contexts/AppContext';
import AuthForm from './AuthForm';
import LoadingSpinner from '../common/LoadingSpinner';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user } = useApp();

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
};