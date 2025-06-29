import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/authService';
import Logo from '../common/Logo';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface EmailVerificationConfirmationProps {
  oobCode: string;
}

const EmailVerificationConfirmation: React.FC<EmailVerificationConfirmationProps> = ({ oobCode }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await AuthService.verifyEmail(oobCode);
        setSuccess(true);
      } catch (error: any) {
        console.error('Email verification error:', error);
        setError(error.message || 'Failed to verify email. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [oobCode]);

  const handleContinue = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-200">
          <div className="text-center">
            <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
              <Logo size="md" className="text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Email
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Please wait while we verify your email address...
            </p>
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-200">
          <div className="text-center">
            <div className="bg-green-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
            <button
              onClick={handleContinue}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              <span>Continue to Login</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-200">
        <div className="text-center">
          <div className="bg-red-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Failed
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            We couldn't verify your email address.
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mb-6">
            {error}
          </p>
          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Back to Login</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationConfirmation;