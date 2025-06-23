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
  RefreshCw,
  Crown,
  Building
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
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | 'reset-password' | 'email-verification'>('signin');
  const [signupStep, setSignupStep] = useState<'user-type' | 'details' | 'verification'>('user-type');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || '');
  const [success, setSuccess] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  
  const [formData, setFormData] = useState({
    userType: 'single' as 'single' | 'team-admin',
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    name: '',
    username: '',
    organizationName: '',
    organizationType: '',
    organizationIndustry: '',
    organizationSize: '',
    userRoleInOrg: '',
    organizationWebsite: '',
    organizationDescription: ''
  });

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    const urlOobCode = urlParams.get('oobCode');
    
    if (urlMode === 'resetPassword' && urlOobCode) {
      handlePasswordResetFromEmail(urlOobCode);
    } else if (urlMode === 'verifyEmail' && urlOobCode) {
      handleEmailVerificationFromLink(urlOobCode);
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

  const handleEmailVerificationFromLink = async (code: string) => {
    try {
      setLoading(true);
      setError('');
      await AuthService.verifyEmailWithCode(code);
      setSuccess('Email verified successfully! You can now access your TaskDefender workspace.');
      setTimeout(() => {
        onAuthSuccess();
      }, 2000);
    } catch (error: any) {
      setError(error.message);
      setMode('signin');
    } finally {
      setLoading(false);
    }
  };

  const validateSignupStep = (): boolean => {
    if (signupStep === 'user-type') {
      return formData.userType !== '';
    }
    
    if (signupStep === 'details') {
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
      if (!formData.email.trim()) {
        setError('Please enter your email address');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      if (formData.userType === 'team-admin') {
        if (!formData.organizationName.trim()) {
          setError('Please enter your organization name');
          return false;
        }
        if (!formData.organizationType) {
          setError('Please select your organization type');
          return false;
        }
        if (!formData.organizationIndustry) {
          setError('Please select your industry');
          return false;
        }
        if (!formData.organizationSize) {
          setError('Please select your organization size');
          return false;
        }
        if (!formData.userRoleInOrg.trim()) {
          setError('Please enter your role in the organization');
          return false;
        }
      }
    }
    
    return true;
  };

  const validateForm = (): boolean => {
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
    
    if (mode === 'signin') {
      if (!formData.email.trim()) {
        setError('Please enter your email address');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (mode === 'signup') {
      if (!validateSignupStep()) {
        return;
      }
      
      if (signupStep === 'user-type') {
        setSignupStep('details');
        return;
      }
      
      if (signupStep === 'details') {
        setLoading(true);
        
        try {
          const userData = {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            username: formData.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
            role: formData.userType === 'team-admin' ? 'admin' as const : 'user' as const,
            goals: [],
            workStyle: 'focused' as const,
            integrityScore: 100,
            streak: 0,
            ...(formData.userType === 'team-admin' && {
              organizationName: formData.organizationName,
              organizationType: formData.organizationType,
              organizationIndustry: formData.organizationIndustry,
              organizationSize: formData.organizationSize,
              userRoleInOrg: formData.userRoleInOrg,
              organizationWebsite: formData.organizationWebsite,
              organizationDescription: formData.organizationDescription,
            })
          };

          console.log('🎯 Creating new TaskDefender account...');
          
          await AuthService.signUp(formData.email, formData.password, userData);
          
          await AuthService.sendEmailVerification();
          
          setVerificationEmail(formData.email);
          setSignupStep('verification');
          setSuccess(`TaskDefender account created! Please check ${formData.email} for a verification link before proceeding.`);
          
        } catch (error: any) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
        return;
      }
    }

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
        
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          setMode('signin');
          resetForm();
        }, 2000);
        return;
      }

      if (mode === 'signin') {
        const user = await AuthService.signIn(formData.email, formData.password);
        
        if (!user.emailVerified) {
          setError('Please verify your email address before signing in. Check your inbox for a verification link.');
          return;
        }
        
        console.log('✅ User signed in:', user);
        onAuthSuccess();
      }
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await AuthService.sendEmailVerification();
      setSuccess('Verification email sent again! Check your inbox.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (error) {
      setError('');
    }
  };

  const resetForm = () => {
    setFormData({
      userType: 'single',
      email: '',
      password: '',
      confirmPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      name: '',
      username: '',
      organizationName: '',
      organizationType: '',
      organizationIndustry: '',
      organizationSize: '',
      userRoleInOrg: '',
      organizationWebsite: '',
      organizationDescription: ''
    });
    setError('');
    setSuccess('');
    setSignupStep('user-type');
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup':
        if (signupStep === 'user-type') return 'Choose Your Path';
        if (signupStep === 'details') return 'Create Your Account';
        if (signupStep === 'verification') return 'Verify Your Email';
        return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'Set New Password';
      case 'email-verification': return 'Email Verification';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup':
        if (signupStep === 'user-type') return 'Are you managing tasks for yourself or a team?';
        if (signupStep === 'details') return 'Tell us about yourself to get started';
        if (signupStep === 'verification') return 'Check your email to verify your account';
        return 'Join TaskDefender and start your productivity journey!';
      case 'forgot-password': return 'Enter your email to reset your password';
      case 'reset-password': return 'Enter your new password below';
      case 'email-verification': return 'Verifying your email address...';
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

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && signupStep === 'user-type' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <button
                    type="button"
                    onClick={() => updateFormData({ userType: 'single' })}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.userType === 'single'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        formData.userType === 'single'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Individual User</h3>
                        <p className="text-gray-600 dark:text-gray-300">Personal productivity and task management</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => updateFormData({ userType: 'team-admin' })}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.userType === 'team-admin'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        formData.userType === 'team-admin'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <Crown className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Admin</h3>
                        <p className="text-gray-600 dark:text-gray-300">Manage teams and organization productivity</p>
                        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Can create and manage teams</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && signupStep === 'details' && (
              <div className="space-y-4">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>

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

                {formData.userType === 'team-admin' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Building className="h-5 w-5 text-orange-500" />
                      <span>Organization Details</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.organizationName}
                          onChange={(e) => updateFormData({ organizationName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                          placeholder="Enter organization name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Organization Type *
                        </label>
                        <select
                          required
                          value={formData.organizationType}
                          onChange={(e) => updateFormData({ organizationType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                        >
                          <option value="">Select type</option>
                          <option value="startup">Startup</option>
                          <option value="sme">Small/Medium Enterprise</option>
                          <option value="enterprise">Large Enterprise</option>
                          <option value="non-profit">Non-Profit</option>
                          <option value="government">Government</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Industry *
                        </label>
                        <select
                          required
                          value={formData.organizationIndustry}
                          onChange={(e) => updateFormData({ organizationIndustry: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                        >
                          <option value="">Select industry</option>
                          <option value="technology">Technology</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="finance">Finance</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="retail">Retail</option>
                          <option value="consulting">Consulting</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Organization Size *
                        </label>
                        <select
                          required
                          value={formData.organizationSize}
                          onChange={(e) => updateFormData({ organizationSize: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                        >
                          <option value="">Select size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-1000">201-1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Role in Organization *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.userRoleInOrg}
                          onChange={(e) => updateFormData({ userRoleInOrg: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                          placeholder="e.g., CEO, Manager, Team Lead"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website <span className="text-gray-500">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          value={formData.organizationWebsite}
                          onChange={(e) => updateFormData({ organizationWebsite: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                          placeholder="https://www.example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description <span className="text-gray-500">(Optional)</span>
                        </label>
                        <textarea
                          value={formData.organizationDescription}
                          onChange={(e) => updateFormData({ organizationDescription: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 resize-none"
                          rows={3}
                          placeholder="Brief description of your organization"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'signup' && signupStep === 'verification' && (
              <div className="text-center space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                  <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We've sent a verification link to:
                  </p>
                  <p className="font-medium text-blue-600 dark:text-blue-400 mb-4">
                    {verificationEmail}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click the link in the email to verify your account and access your TaskDefender workspace.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-200 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Resend Verification Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      resetForm();
                    }}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Back to Sign In
                  </button>
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

            {mode === 'signin' && (
              <>
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
                </div>
              </>
            )}

            {mode === 'forgot-password' && (
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

            {mode !== 'signup' || signupStep !== 'verification' ? (
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
                       mode === 'signup' && signupStep === 'user-type' ? 'Continue' :
                       mode === 'signup' && signupStep === 'details' ? 'Create Account & Send Verification' :
                       mode === 'forgot-password' ? 'Send Reset Email' :
                       'Reset Password'}
                    </span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            ) : null}
          </form>

          {mode === 'signup' && signupStep === 'details' && (
            <div className="mt-4">
              <button
                onClick={() => setSignupStep('user-type')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to User Type</span>
              </button>
            </div>
          )}

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

          <div className="mt-6 text-center space-y-2">
            {(mode === 'forgot-password' || mode === 'reset-password') ? (
              <button
                onClick={() => {
                  setMode('signin');
                  resetForm();
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </button>
            ) : mode !== 'signup' || signupStep === 'verification' ? (
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
            ) : null}
          </div>

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