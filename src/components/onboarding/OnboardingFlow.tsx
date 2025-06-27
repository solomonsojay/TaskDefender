import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Shield,
  Users,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType } from '../../types';
import { AuthService } from '../../services/authService';
import Logo from '../common/Logo';
import WorkStyleForm from './WorkStyleForm';
import OrganizationDetailsForm from './OrganizationDetailsForm';

interface FormData {
  // User Type
  userType: 'personal' | 'team-admin';
  
  // Work Style
  workStyle: 'focused' | 'flexible' | 'collaborative';
  focusSessionLength: number;
  breakLength: number;
  
  // Organization Details (for team admins)
  organizationName: string;
  organizationType: string;
  organizationIndustry: string;
  organizationSize: string;
  userRoleInOrg: string;
  organizationWebsite: string;
  organizationDescription: string;
}

const OnboardingFlow: React.FC = () => {
  const { user, setUser, dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // User Type
    userType: user?.role === 'admin' ? 'team-admin' : 'personal',
    
    // Work Style
    workStyle: 'focused',
    focusSessionLength: 25,
    breakLength: 5,
    
    // Organization Details
    organizationName: user?.organizationName || '',
    organizationType: user?.organizationType || '',
    organizationIndustry: user?.organizationIndustry || '',
    organizationSize: user?.organizationSize || '',
    userRoleInOrg: user?.userRoleInOrg || '',
    organizationWebsite: user?.organizationWebsite || '',
    organizationDescription: user?.organizationDescription || ''
  });

  const totalSteps = formData.userType === 'personal' ? 2 : 3;

  const completeOnboarding = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const updates: Partial<UserType> = {
        workStyle: formData.workStyle,
        role: formData.userType === 'team-admin' ? 'admin' : 'user'
      };
      
      // Add organization details for team admins
      if (formData.userType === 'team-admin') {
        updates.organizationName = formData.organizationName;
        updates.organizationType = formData.organizationType;
        updates.organizationIndustry = formData.organizationIndustry;
        updates.organizationSize = formData.organizationSize;
        updates.userRoleInOrg = formData.userRoleInOrg;
        updates.organizationWebsite = formData.organizationWebsite;
        updates.organizationDescription = formData.organizationDescription;
      }
      
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: // User Type Selection
        return formData.userType !== undefined;
      case 2: // Work Style Selection
        return formData.workStyle !== undefined;
      case 3: // Organization Details (for team admins)
        return formData.userType === 'team-admin' && 
               formData.organizationName.trim() !== '' && 
               formData.organizationType !== '' && 
               formData.organizationIndustry !== '' && 
               formData.organizationSize !== '' && 
               formData.userRoleInOrg.trim() !== '';
      default:
        return false;
    }
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
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
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
              Let's set up your account to get started
            </p>
          </div>

          {/* Step 1: User Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="bg-blue-500/20 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-500 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  How will you use TaskDefender?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose your account type to customize your experience
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => updateFormData({ userType: 'personal' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.userType === 'personal'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      formData.userType === 'personal'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Personal User</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Individual productivity tracking and task management
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => updateFormData({ userType: 'team-admin' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.userType === 'team-admin'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      formData.userType === 'team-admin'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Team Admin</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Create and manage teams with collaborative productivity
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mt-4">
                <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                  Account Type Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-600 dark:text-blue-300 mb-1">Personal User</h5>
                    <ul className="space-y-1 text-blue-600 dark:text-blue-300">
                      <li>• Individual task management</li>
                      <li>• Personal productivity analytics</li>
                      <li>• Focus mode and reminders</li>
                      <li>• Achievement tracking</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-600 dark:text-blue-300 mb-1">Team Admin</h5>
                    <ul className="space-y-1 text-blue-600 dark:text-blue-300">
                      <li>• All personal features</li>
                      <li>• Create and manage teams</li>
                      <li>• Team productivity analytics</li>
                      <li>• Member management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Work Style Selection */}
          {currentStep === 2 && (
            <WorkStyleForm
              data={{
                workStyle: formData.workStyle,
                focusSessionLength: formData.focusSessionLength,
                breakLength: formData.breakLength
              }}
              onChange={(updates) => updateFormData(updates)}
            />
          )}

          {/* Step 3: Organization Details (for team admins) */}
          {currentStep === 3 && formData.userType === 'team-admin' && (
            <OrganizationDetailsForm
              data={{
                organizationName: formData.organizationName,
                organizationType: formData.organizationType,
                organizationIndustry: formData.organizationIndustry,
                organizationSize: formData.organizationSize,
                userRoleInOrg: formData.userRoleInOrg,
                organizationWebsite: formData.organizationWebsite,
                organizationDescription: formData.organizationDescription
              }}
              onChange={(updates) => updateFormData(updates)}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                disabled={loading}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
            ) : (
              <div></div> // Empty div to maintain flex layout
            )}
            
            <button
              onClick={nextStep}
              disabled={!canProceed() || loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : currentStep === totalSteps ? (
                <>
                  <span>Complete Setup</span>
                  <CheckCircle className="h-5 w-5" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
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