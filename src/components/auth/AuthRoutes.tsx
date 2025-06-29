import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import PasswordResetForm from './PasswordResetForm';
import EmailVerificationConfirmation from './EmailVerificationConfirmation';

const AuthRoutes: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Extract action and oobCode from URL
  const mode = queryParams.get('mode');
  const oobCode = queryParams.get('oobCode');
  
  if (!mode || !oobCode) {
    return <Navigate to="/" replace />;
  }
  
  switch (mode) {
    case 'resetPassword':
      return <PasswordResetForm oobCode={oobCode} onBackToLogin={() => window.location.href = '/'} />;
    
    case 'verifyEmail':
      return <EmailVerificationConfirmation oobCode={oobCode} />;
    
    default:
      return <Navigate to="/" replace />;
  }
};

export default AuthRoutes;