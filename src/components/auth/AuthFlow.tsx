import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Shield,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { useApp } from '../../context/AppContext';
import Logo from '../common/Logo';

interface AuthFlowProps {
  onAuthSuccess: () => void;
  initialError?: string | null;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess, initialError }) => {
  const { dispatch } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | 'reset-password'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || '');
  const [success, setSuccess] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [oobCode, setOobCode] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    name: '',
    username: ''
  });

  // Clear initial error when mode changes
  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  // Check for password reset parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    const urlOobCode = urlParams.get('oobCode');
    
    if (urlMode === 'resetPassword' && urlOobCode) {
      handlePasswordResetFromEmail(urlOobCode);
    }
  }, []);

  const handlePasswordResetFromEmail = async (code: string) => {
    try {
      setLoading(true);
      setError('');
      const email = await AuthService.verifyPasswordResetCode(code);
      setResetEmail(email);
      setOobCode(code);
      setMode('reset-password');
      setSuccess(`Password reset verified for ${email}. Please enter your new password.`);
    } catch (error: any) {
      setError(error.message);
      setMode('signin');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (!formData.username.trim()) {
        setError('Please enter a username');
        return false;
      }
      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    if (mode === 'reset-password') {
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    
    if ((mode === 'signin' || mode === 'signup') && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (!formData.email.trim() && mode !== 'reset-password') {
      setError('Please enter your email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        await AuthService.resetPassword(formData.email);
        setSuccess(`Password reset email sent to ${formData.email}! Check your inbox and follow the instructions to reset your password.`);
        return;
      }

      if (mode === 'reset-password') {
        await AuthService.confirmPasswordReset(oobCode, formData.newPassword);
        setSuccess('Password reset successfully! You can now sign in with your new password.');
        
        // Clear URL parameters and redirect to sign in
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          setMode('signin');
          resetForm();
        }, 2000);
        return;
      }

      if (mode === 'signup') {
        // Create user data for signup - IMPORTANT: Set workStyle and role to undefined to force onboarding
        const userData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          username: formData.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          role: undefined as any, // This will force onboarding
          goals: [],
          workStyle: undefined as any, // This will force onboarding
          integrityScore: 100,
          streak: 0
        };

        console.log('🎯 Creating new user - will trigger onboarding due to undefined workStyle/role');
        
        const user = await AuthService.signUp(formData.email, formData.password, userData);
        console.log('✅ New user created, onboarding will be triggered');
      } else {
        // Sign in existing user
        const user = await AuthService.signIn(formData.email, formData.password);
        console.log('✅ User signed in:', user);
      }
      
      // Call success handler which will check if onboarding is needed
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors when user starts typing
    if (error) {
      setError('');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      name: '',
      username: ''
    });
    setError('');
    setSuccess('');
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'Set New Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Join TaskDefender and start your productivity journey!';
      case 'forgot-password': return 'Enter your email to reset your password';
      case 'reset-password': return 'Enter your new password below';
      default: return 'Sign in to continue defending against procrastination';
    }
  };

  const resendResetEmail = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      setLoading(true);
      await AuthService.resetPassword(formData.email);
      setSuccess('Password reset email sent again! Check your inbox.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-lg text-orange-600 dark:text-orange-400 font-medium mb-2">
              Your Last Line of Defense Against Procrastination
            </p>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getTitle()}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {getSubtitle()}
              </p>
            </div>
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

          {/* Reset Email Info */}
          {mode === 'reset-password' && resetEmail && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  Resetting password for: <strong>{resetEmail}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Onboarding Notice for Signup */}
          {mode === 'signup' && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-700 dark:text-orange-400 text-sm font-medium mb-1">
                    Custom Setup Process
                  </p>
                  <p className="text-orange-600 dark:text-orange-300 text-xs">
                    After creating your account, you'll go through our personalized setup to configure TaskDefender based on whether you're an individual user or team admin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => updateFormData({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Choose a username"
                      maxLength={20}
                      minLength={3}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Only lowercase letters, numbers, and underscores (min 3 characters)
                  </p>
                </div>
              </>
            )}

            {mode !== 'reset-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            {mode === 'reset-password' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.newPassword}
                      onChange={(e) => updateFormData({ newPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter your new password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmNewPassword}
                      onChange={(e) => updateFormData({ confirmNewPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>
              </>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => updateFormData({ password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' ? 'Sign In' : 
                     mode === 'signup' ? 'Create Account' : 
                     mode === 'forgot-password' ? 'Send Reset Email' :
                     'Reset Password'}
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Resend Reset Email */}
          {mode === 'forgot-password' && success && (
            <div className="mt-4 text-center">
              <button
                onClick={resendResetEmail}
                disabled={loading}
                className="flex items-center justify-center space-x-2 text-orange-600 dark:text-orange-400 font-medium hover:underline text-sm mx-auto disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Resend Email</span>
              </button>
            </div>
          )}

          {/* Forgot Password Link */}
          {mode === 'signin' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setMode('forgot-password');
                  resetForm();
                }}
                className="text-orange-600 dark:text-orange-400 font-medium hover:underline text-sm"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="mt-6 text-center space-y-2">
            {(mode === 'forgot-password' || mode === 'reset-password') ? (
              <button
                onClick={() => {
                  setMode('signin');
                  resetForm();
                  // Clear URL parameters if coming from email reset
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </button>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    resetForm();
                  }}
                  className="ml-2 text-orange-600 dark:text-orange-400 font-medium hover:underline"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
            <p className="text-xs text-blue-600 dark:text-blue-300 text-center">
              🔒 Your data is securely stored and encrypted. TaskDefender respects your privacy and never shares your personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;