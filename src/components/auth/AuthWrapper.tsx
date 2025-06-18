import React from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  // No authentication required - always render children
  return <>{children}</>;
};

export default AuthWrapper;