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

  const totalSteps = user?.role === 'admin' ? 2 : 1;

  const completeOnboarding = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const updates: Partial<UserType> = {
        workStyle: formData.workStyle
      };
      
      // Add organization details for team admins
      if (user.role === 'admin') {
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
      case 1: // Work Style Selection
        return formData.workStyle !== undefined;
      case 2: // Organization Details (for team admins)
        return user?.role === 'admin' && 
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

          {/* Step 1: Work Style Selection */}
          {currentStep === 1 && (
            <WorkStyleForm
              data={{
                workStyle: formData.workStyle,
                focusSessionLength: formData.focusSessionLength,
                breakLength: formData.breakLength
              }}
              onChange={(updates) => updateFormData(updates)}
            />
          )}

          {/* Step 2: Organization Details (for team admins) */}
          {currentStep === 2 && user.role === 'admin' && (
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
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center space-x-2"
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