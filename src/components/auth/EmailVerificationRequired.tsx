import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthService } from '../../services/authService';
import Logo from '../common/Logo';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

interface EmailVerificationRequiredProps {
  onBackToLogin: () => void;
}

const EmailVerificationRequired: React.FC<EmailVerificationRequiredProps> = ({ onBackToLogin }) => {
  const { signOut } = useApp();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess(false);
    
    try {
      // In local mode, this will throw an error
      await AuthService.resendEmailVerification();
      setResendSuccess(true);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      alert('Email verification is not available in local mode.');
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onBackToLogin();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-200">
        <div className="text-center mb-8">
          <div className="bg-blue-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
            <Mail className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Please check your inbox
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We've sent you a verification email. Please click the link in the email to verify your account.
          </p>
        </div>
        
        {resendSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 mb-6">
            <p className="text-green-600 dark:text-green-400 text-sm">
              Verification email has been resent. Please check your inbox.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            <span>{resending ? 'Sending...' : 'Resend Verification Email'}</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Login</span>
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            After verifying your email, please refresh this page or log in again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationRequired;