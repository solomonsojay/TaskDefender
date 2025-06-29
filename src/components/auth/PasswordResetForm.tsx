import React, { useState } from 'react';
import { AuthService } from '../../services/authService';
import Logo from '../common/Logo';
import { Key, ArrowLeft, CheckCircle } from 'lucide-react';

interface PasswordResetFormProps {
  oobCode: string;
  onBackToLogin: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ oobCode, onBackToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!password || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // In local mode, this will throw an error
      await AuthService.confirmPasswordReset(oobCode, password);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError('Password reset is not available in local mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-200">
      <div className="text-center mb-8">
        <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
          <Logo size="md" className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reset Link Expired
        </h1>
        <p className="text-lg text-orange-600 dark:text-orange-400 font-medium">
          Password reset is not available in local mode
        </p>
      </div>
      
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Password reset functionality requires Firebase authentication, which is not available in local mode.
        </p>
      </div>
      
      <button
        onClick={onBackToLogin}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Login</span>
      </button>
    </div>
  );
};

export default PasswordResetForm;