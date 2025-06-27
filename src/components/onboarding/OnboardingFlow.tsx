import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft,
  Target, 
  Users, 
  Clock,
  CheckCircle,
  User,
  Crown,
  Building,
  Shield,
  Briefcase,
  Calendar,
  Brain,
  Zap,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType } from '../../types';
import { AuthService } from '../../services/authService';
import Logo from '../common/Logo';
import PersonalInfoForm from './PersonalInfoForm';
import WorkStyleForm from './WorkStyleForm';
import GoalsForm from './GoalsForm';
import OrganizationDetailsForm from './OrganizationDetailsForm';
import NotificationPreferencesForm from './NotificationPreferencesForm';

interface FormData {
  // Personal Info
  name: string;
  username: string;
  bio: string;
  
  // Work Style
  workStyle: 'focused' | 'flexible' | 'collaborative';
  focusSessionLength: number;
  breakLength: number;
  
  // Goals
  goals: string[];
  weeklyTarget: number;
  
  // Organization (for admin users)
  organizationName: string;
  organizationType: string;
  organizationIndustry: string;
  organizationSize: string;
  userRoleInOrg: string;
  organizationWebsite: string;
  organizationDescription: string;
  
  // Notification Preferences
  enableNotifications: boolean;
  enableVoiceCalls: boolean;
  enableDefenseSystem: boolean;
  notificationFrequency: 'low' | 'medium' | 'high';
  preferredCharacter: 'default' | 'mom' | 'coach' | 'custom';
}

const OnboardingFlow: React.FC = () => {
  const { user, setUser, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Personal Info
    name: user?.name || '',
    username: user?.username || '',
    bio: '',
    
    // Work Style
    workStyle: 'focused',
    focusSessionLength: 25,
    breakLength: 5,
    
    // Goals
    goals: [],
    weeklyTarget: 15,
    
    // Organization
    organizationName: user?.organizationName || '',
    organizationType: user?.organizationType || '',
    organizationIndustry: user?.organizationIndustry || '',
    organizationSize: user?.organizationSize || '',
    userRoleInOrg: user?.userRoleInOrg || '',
    organizationWebsite: user?.organizationWebsite || '',
    organizationDescription: user?.organizationDescription || '',
    
    // Notification Preferences
    enableNotifications: true,
    enableVoiceCalls: true,
    enableDefenseSystem: true,
    notificationFrequency: 'medium',
    preferredCharacter: 'default'
  });

  // Determine total steps based on user role
  const totalSteps = user?.role === 'admin' ? 5 : 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const updates: Partial<UserType> = {
        name: formData.name,
        username: formData.username,
        workStyle: formData.workStyle,
        goals: formData.goals,
      };
      
      // Add organization details for admin users
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
      
      // Save notification preferences
      localStorage.setItem('taskdefender_notification_preferences', JSON.stringify({
        enableNotifications: formData.enableNotifications,
        enableVoiceCalls: formData.enableVoiceCalls,
        enableDefenseSystem: formData.enableDefenseSystem,
        notificationFrequency: formData.notificationFrequency,
        preferredCharacter: formData.preferredCharacter
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
    switch (step) {
      case 1: // Personal Info
        return formData.name.trim() !== '' && formData.username.trim() !== '';
      case 2: // Work Style
        return formData.workStyle !== undefined;
      case 3: // Goals
        return formData.goals.length > 0;
      case 4: // Organization (admin only)
        if (user?.role === 'admin') {
          return formData.organizationName.trim() !== '';
        }
        return true;
      case 5: // Notification Preferences
        return true;
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
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
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
              Let's set up your account to maximize your productivity
            </p>
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <PersonalInfoForm 
              data={{
                name: formData.name,
                username: formData.username,
                bio: formData.bio
              }}
              onChange={(updates) => updateFormData(updates)}
            />
          )}

          {/* Step 2: Work Style */}
          {step === 2 && (
            <WorkStyleForm
              data={{
                workStyle: formData.workStyle,
                focusSessionLength: formData.focusSessionLength,
                breakLength: formData.breakLength
              }}
              onChange={(updates) => updateFormData(updates)}
            />
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <GoalsForm
              data={{
                goals: formData.goals,
                weeklyTarget: formData.weeklyTarget
              }}
              onChange={(updates) => updateFormData(updates)}
            />
          )}

          {/* Step 4: Organization Details (admin only) */}
          {step === 4 && user.role === 'admin' && (
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

          {/* Step 4/5: Notification Preferences */}
          {((user.role === 'admin' && step === 5) || (user.role !== 'admin' && step === 4)) && (
            <NotificationPreferencesForm
              data={{
                enableNotifications: formData.enableNotifications,
                enableVoiceCalls: formData.enableVoiceCalls,
                enableDefenseSystem: formData.enableDefenseSystem,
                notificationFrequency: formData.notificationFrequency,
                preferredCharacter: formData.preferredCharacter
              }}
              onChange={(updates) => updateFormData(updates)}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                step === 1
                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{step === totalSteps ? 'Complete Setup' : 'Continue'}</span>
                  {step === totalSteps ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </>
              )}
            </button>
          </div>

          {/* TaskDefender Branding */}
          <div className="mt-6 text-center">
            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              🛡️ Your Last Line of Defense Against Procrastination
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;