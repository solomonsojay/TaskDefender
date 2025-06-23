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
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType } from '../../types';
import { AuthService } from '../../services/authService';
import Logo from '../common/Logo';

interface FormData {
  // Session preference (only thing we collect in onboarding now)
  sessionType: 'focused' | 'flexible' | 'collaborative';
}

const OnboardingFlow: React.FC = () => {
  const { user, setUser, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    sessionType: 'focused'
  });

  const totalSteps = 1; // Only work style selection now

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
        workStyle: formData.sessionType
      };
      
      // Update user in Firebase/localStorage
      await AuthService.updateUser(user.id, updates);
      
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
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

  const sessionTypeOptions = [
    {
      id: 'focused' as const,
      title: 'Deep Focus Sessions',
      description: 'Long, uninterrupted work periods with minimal distractions',
      icon: Target,
    },
    {
      id: 'flexible' as const,
      title: 'Flexible Sessions',
      description: 'Adaptable schedule with variety and shorter bursts',
      icon: Clock,
    },
    {
      id: 'collaborative' as const,
      title: 'Collaborative Sessions',
      description: 'Team-based work with shared accountability',
      icon: Users,
    },
  ];

  const canProceed = () => {
    return formData.sessionType;
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
          {/* Step 1: Work Style Preference */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
                  <Logo size="md" className="text-orange-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to TaskDefender, {user.name}!
                </h1>
                <p className="text-lg text-orange-600 dark:text-orange-400 font-medium mb-2">
                  Your Last Line of Defense Against Procrastination
                </p>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Work Style Preference
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    How do you prefer to work and defend against procrastination?
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {sessionTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateFormData({ sessionType: option.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.sessionType === option.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        formData.sessionType === option.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <option.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{option.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* User Info Display */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-6">
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
                    <span className="ml-2 text-blue-800 dark:text-blue-200 flex items-center space-x-1">
                      {user.role === 'admin' ? (
                        <>
                          <Crown className="h-4 w-4" />
                          <span>Team Admin</span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4" />
                          <span>Individual User</span>
                        </>
                      )}
                    </span>
                  </div>
                  {user.organizationName && (
                    <div className="md:col-span-2">
                      <span className="text-blue-600 dark:text-blue-300 font-medium">Organization:</span>
                      <span className="ml-2 text-blue-800 dark:text-blue-200 flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{user.organizationName}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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