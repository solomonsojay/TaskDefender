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
  Building
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { User as UserType } from '../../types';
import Logo from '../common/Logo';

const OnboardingFlow: React.FC = () => {
  const { setUser, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'user' as 'user' | 'admin',
    goals: [] as string[],
    workStyle: 'focused' as 'focused' | 'flexible' | 'collaborative',
    organizationName: '',
    organizationType: '',
    organizationIndustry: '',
    organizationSize: '',
    userRoleInOrg: '',
    organizationWebsite: '',
    organizationDescription: '',
  });

  const totalSteps = formData.role === 'admin' ? 5 : 4;

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

  const completeOnboarding = () => {
    const user: UserType = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      username: formData.username,
      role: formData.role,
      goals: formData.goals,
      workStyle: formData.workStyle,
      integrityScore: 100,
      streak: 0,
      createdAt: new Date(),
      ...(formData.role === 'admin' && {
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        organizationIndustry: formData.organizationIndustry,
        organizationSize: formData.organizationSize,
        userRoleInOrg: formData.userRoleInOrg,
        organizationWebsite: formData.organizationWebsite,
        organizationDescription: formData.organizationDescription,
      })
    };
    
    setUser(user);
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData({ ...formData, ...updates });
  };

  const toggleGoal = (goal: string) => {
    const newGoals = formData.goals.includes(goal)
      ? formData.goals.filter(g => g !== goal)
      : [...formData.goals, goal];
    updateFormData({ goals: newGoals });
  };

  const goalOptions = [
    'Reduce Procrastination',
    'Improve Focus',
    'Better Time Management',
    'Increase Productivity',
    'Build Consistency',
    'Team Collaboration',
  ];

  const workStyleOptions = [
    {
      id: 'focused',
      title: 'Deep Focus',
      description: 'Long, uninterrupted work sessions',
      icon: Target,
    },
    {
      id: 'flexible',
      title: 'Flexible',
      description: 'Adaptable schedule with variety',
      icon: Clock,
    },
    {
      id: 'collaborative',
      title: 'Collaborative',
      description: 'Team-based work and accountability',
      icon: Users,
    },
  ];

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.role;
      case 2:
        return formData.name && formData.email && formData.username;
      case 3:
        return formData.goals.length > 0;
      case 4:
        return formData.workStyle;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full">
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
          {step === 1 && (
            <div className="text-center">
              <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
                <Logo size="md" className="text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Task Defender
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Your last line of defense against procrastination
              </p>
              
              <div className="space-y-4 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Choose Your Role
                </h2>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => updateFormData({ role: 'user' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.role === 'user'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-6 w-6 text-orange-500" />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Single User</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Personal productivity focus</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => updateFormData({ role: 'admin' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.role === 'admin'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Crown className="h-6 w-6 text-orange-500" />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Team Admin</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Manage teams and organization</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Tell us about yourself
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => updateFormData({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Choose a username"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Only lowercase letters, numbers, and underscores allowed
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                What are your goals?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Select all that apply to personalize your experience
              </p>
              
              <div className="space-y-3 mb-8">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.goals.includes(goal)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.goals.includes(goal)
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.goals.includes(goal) && (
                          <CheckCircle className="h-3 w-3 text-white fill-current" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{goal}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Work Style Preference
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                How do you prefer to work?
              </p>
              
              <div className="space-y-4 mb-8">
                {workStyleOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateFormData({ workStyle: style.id as any })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.workStyle === style.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        formData.workStyle === style.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <style.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{style.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{style.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
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
              disabled={!canProceed()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{step === totalSteps ? 'Complete Setup' : 'Continue'}</span>
              {step === totalSteps ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;