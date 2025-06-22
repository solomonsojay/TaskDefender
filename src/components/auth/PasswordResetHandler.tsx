import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Logo from '../common/Logo';

interface PasswordResetHandlerProps {
  onComplete: () => void;
}

const PasswordResetHandler: React.FC<PasswordResetHandlerProps> = ({ onComplete }) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionResult, setActionResult] = useState<any>(null);

  useEffect(() => {
    const handleAuthAction = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');
      const continueUrl = searchParams.get('continueUrl');

      if (!mode || !oobCode) {
        setError('Invalid or missing parameters in the URL.');
        setLoading(false);
        return;
      }

      try {
        const result = await AuthService.handleAuthAction(mode, oobCode, continueUrl || undefined);
        setActionResult(result);

        switch (result.mode) {
          case 'resetPassword':
            setSuccess(`Password reset verified for ${result.email}. You can now set a new password.`);
            break;
          case 'verifyEmail':
            setSuccess('Email verified successfully! You can now sign in.');
            break;
          case 'recoverEmail':
            setSuccess('Email recovery completed successfully.');
            break;
          default:
            setSuccess('Action completed successfully.');
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleAuthAction();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
              <Logo size="md" className="text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Processing Request
            </h1>
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Please wait while we process your request...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
              <Logo size="md" className="text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              TaskDefender
            </h1>
            <p className="text-lg text-orange-600 dark:text-orange-400 font-medium">
              Your Last Line of Defense Against Procrastination
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Action-specific content */}
          {actionResult?.mode === 'resetPassword' && success && (
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You will be redirected to set your new password shortly.
              </p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue to TaskDefender</span>
          </button>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
            <p className="text-xs text-blue-600 dark:text-blue-300 text-center">
              If you're having trouble, please contact support or try again later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetHandler;