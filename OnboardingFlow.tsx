import React, { useState } from 'react';
import { 
  ArrowRight, 
  Target, 
  Users, 
  Clock,
  CheckCircle,
  User,
  Crown
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
    role: 'user' as 'user' | 'admin',
    goals: [] as string[],
    workStyle: 'focused' as 'focused' | 'flexible' | 'collaborative',
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    const user: UserType = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      goals: formData.goals,
      workStyle: formData.workStyle,
      integrityScore: 100,
      streak: 0,
      createdAt: new Date(),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-200">
          {step === 1 && (
            <div className="text-center">
              <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
                <Logo size="md\" className="text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Task Defender
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Your personal productivity guardian against procrastination
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
                        <h3 className="font-semibold text-gray-900 dark:text-white">Regular User</h3>
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
                        <p className="text-sm text-gray-600 dark:text-gray-300">Manage teams and members</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.role}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="h-5 w-5" />
              </button>
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
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.name || !formData.email}
                className="w-full mt-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="h-5 w-5" />
              </button>
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

              <button
                onClick={handleNext}
                disabled={formData.goals.length === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="h-5 w-5" />
              </button>
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

              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Complete Setup</span>
                <CheckCircle className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;