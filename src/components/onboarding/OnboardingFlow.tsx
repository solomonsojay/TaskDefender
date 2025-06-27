import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle,
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType } from '../../types';
import { AuthService } from '../../services/authService';
import Logo from '../common/Logo';
import WorkStyleForm from './WorkStyleForm';

interface FormData {
  // Work Style - the only thing we need in onboarding
  workStyle: 'focused' | 'flexible' | 'collaborative';
  focusSessionLength: number;
  breakLength: number;
}

const OnboardingFlow: React.FC = () => {
  const { user, setUser, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    workStyle: 'focused',
    focusSessionLength: 25,
    breakLength: 5
  });

  const totalSteps = 1; // Only work style selection

  const completeOnboarding = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const updates: Partial<UserType> = {
        workStyle: formData.workStyle
      };
      
      // Update user in localStorage
      await AuthService.updateUser(user.id, updates);
      
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Save focus preferences
      localStorage.setItem('taskdefender_focus_preferences', JSON.stringify({
        focusSessionLength: formData.focusSessionLength,
        breakLength: formData.breakLength
      }));
      
      // Complete onboarding
      dispatch({ type: 'COMPLETE_ONBOARDING' });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData({ ...formData, ...updates });
  };

  const canProceed = () => {
    return formData.workStyle !== undefined;
  };

  if (!user) {
    return null; // Should not happen as auth is required
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Step 1 of {totalSteps}</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
              <Logo size="md" className="text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to TaskDefender, {user.name}!
            </h1>
            <p className="text-lg text-orange-600 dark:text-orange-400 font-medium mb-2">
              Your Last Line of Defense Against Procrastination
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Let's set up your work style preference to get started
            </p>
          </div>

          {/* Work Style Selection */}
          <WorkStyleForm
            data={{
              workStyle: formData.workStyle,
              focusSessionLength: formData.focusSessionLength,
              breakLength: formData.breakLength
            }}
            onChange={(updates) => updateFormData(updates)}
          />

          {/* User Info Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-6 mt-6">
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Your Profile</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600 dark:text-blue-300 font-medium">Name:</span>
                <span className="ml-2 text-blue-800 dark:text-blue-200">{user.name}</span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-300 font-medium">Email:</span>
                <span className="ml-2 text-blue-800 dark:text-blue-200">{user.email}</span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-300 font-medium">Username:</span>
                <span className="ml-2 text-blue-800 dark:text-blue-200">@{user.username}</span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-300 font-medium">Role:</span>
                <span className="ml-2 text-blue-800 dark:text-blue-200">
                  {user.role === 'admin' ? 'Team Admin' : 'Individual User'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end mt-8">
            <button
              onClick={completeOnboarding}
              disabled={!canProceed() || loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Setup</span>
                  <CheckCircle className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* TaskDefender Branding */}
          <div className="mt-6 text-center">
            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              🛡️ Your Last Line of Defense Against Procrastination
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              You can customize voice calls, notifications, and other settings later in your profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;