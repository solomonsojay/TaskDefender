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
  // User type
  userType: 'single' | 'team-admin';
  
  // Session preference
  sessionType: 'focused' | 'flexible' | 'collaborative';
  
  // Organization details (for team admin only)
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    userType: 'single',
    sessionType: 'focused',
    organizationName: '',
    organizationType: '',
    organizationIndustry: '',
    organizationSize: '',
    userRoleInOrg: '',
    organizationWebsite: '',
    organizationDescription: '',
  });

  const totalSteps = formData.userType === 'team-admin' ? 3 : 2;

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
        role: formData.userType === 'team-admin' ? 'admin' : 'user',
        workStyle: formData.sessionType,
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
      
      // Update user in Firebase
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
    switch (step) {
      case 1:
        return formData.userType;
      case 2:
        return formData.sessionType;
      case 3:
        return formData.userType !== 'team-admin' || (
          formData.organizationName &&
          formData.organizationType &&
          formData.organizationIndustry &&
          formData.organizationSize &&
          formData.userRoleInOrg
        );
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
          {/* Step 1: User Type Selection */}
          {step === 1 && (
            <div className="text-center">
              <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
                <Logo size="md" className="text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to TaskDefender, {user.name}!
              </h1>
              <p className="text-lg text-orange-600 dark:text-orange-400 font-medium mb-2">
                Your Last Line of Defense Against Procrastination
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Let's set up your productivity preferences
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => updateFormData({ userType: 'single' })}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
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
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Individual User</h3>
                        <p className="text-gray-600 dark:text-gray-300">Personal productivity and task management</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => updateFormData({ userType: 'team-admin' })}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
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
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Admin</h3>
                        <p className="text-gray-600 dark:text-gray-300">Manage teams and organization productivity</p>
                        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Can create and manage teams</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Session Type Preference */}
          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <div className="bg-green-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                  <Shield className="h-10 w-10 text-green-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Work Style Preference
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  How do you prefer to work and defend against procrastination?
                </p>
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
            </div>
          )}

          {/* Step 3: Organization Details (Team Admin Only) */}
          {step === 3 && formData.userType === 'team-admin' && (
            <div>
              <div className="text-center mb-6">
                <div className="bg-purple-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                  <Building className="h-10 w-10 text-purple-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Organization Details
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Set up your organization for team productivity management
                </p>
              </div>
              
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none"
                    rows={3}
                    placeholder="Brief description of your organization"
                  />
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