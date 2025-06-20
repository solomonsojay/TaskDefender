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
  PhoneCall,
  Mic,
  Upload,
  Volume2,
  Shield,
  Zap,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType } from '../../types';
import Logo from '../common/Logo';

interface FormData {
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  goals: string[];
  workStyle: 'focused' | 'flexible' | 'collaborative';
  organizationName: string;
  organizationType: string;
  organizationIndustry: string;
  organizationSize: string;
  userRoleInOrg: string;
  organizationWebsite: string;
  organizationDescription: string;
  // Voice call settings
  enableVoiceCalls: boolean;
  voiceCallInterval: number;
  selectedCharacter: string;
  customCharacterName: string;
  customPrompts: string[];
  selectedVoice: string;
  // Task defense settings
  enableTaskDefense: boolean;
  honestyCheckpoints: boolean;
  criticalTaskAlerts: boolean;
  procrastinationDefense: boolean;
}

const OnboardingFlow: React.FC = () => {
  const { setUser, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [customVoiceBlob, setCustomVoiceBlob] = useState<Blob | null>(null);
  const [newPrompt, setNewPrompt] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    username: '',
    role: 'user',
    goals: [],
    workStyle: 'focused',
    organizationName: '',
    organizationType: '',
    organizationIndustry: '',
    organizationSize: '',
    userRoleInOrg: '',
    organizationWebsite: '',
    organizationDescription: '',
    enableVoiceCalls: true,
    voiceCallInterval: 30,
    selectedCharacter: 'default',
    customCharacterName: 'My Assistant',
    customPrompts: [],
    selectedVoice: 'en-US-female',
    enableTaskDefense: true,
    honestyCheckpoints: true,
    criticalTaskAlerts: true,
    procrastinationDefense: true,
  });

  const totalSteps = formData.role === 'admin' ? 7 : 6;

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
    
    // Save voice call settings
    const voiceSettings = {
      enableCalls: formData.enableVoiceCalls,
      callInterval: formData.voiceCallInterval,
      selectedCharacter: formData.selectedCharacter,
      customCharacterName: formData.customCharacterName,
      customPrompts: formData.customPrompts,
      selectedVoice: formData.selectedVoice,
      customVoiceBlob: customVoiceBlob,
      callFrequency: 'normal' as const
    };
    localStorage.setItem('taskdefender_voice_settings', JSON.stringify(voiceSettings));

    // Save task defense settings
    const taskDefenseSettings = {
      enableTaskDefense: formData.enableTaskDefense,
      honestyCheckpoints: formData.honestyCheckpoints,
      criticalTaskAlerts: formData.criticalTaskAlerts,
      procrastinationDefense: formData.procrastinationDefense
    };
    localStorage.setItem('taskdefender_defense_settings', JSON.stringify(taskDefenseSettings));
    
    setUser(user);
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData({ ...formData, ...updates });
  };

  const toggleGoal = (goal: string) => {
    const newGoals = formData.goals.includes(goal)
      ? formData.goals.filter(g => g !== goal)
      : [...formData.goals, goal];
    updateFormData({ goals: newGoals });
  };

  const addCustomPrompt = () => {
    if (newPrompt.trim()) {
      updateFormData({ 
        customPrompts: [...formData.customPrompts, newPrompt.trim()] 
      });
      setNewPrompt('');
    }
  };

  const removePrompt = (index: number) => {
    updateFormData({
      customPrompts: formData.customPrompts.filter((_, i) => i !== index)
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setCustomVoiceBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 10000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
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
      id: 'focused' as const,
      title: 'Deep Focus',
      description: 'Long, uninterrupted work sessions',
      icon: Target,
    },
    {
      id: 'flexible' as const,
      title: 'Flexible',
      description: 'Adaptable schedule with variety',
      icon: Clock,
    },
    {
      id: 'collaborative' as const,
      title: 'Collaborative',
      description: 'Team-based work and accountability',
      icon: Users,
    },
  ];

  const voiceCharacters = [
    { id: 'default', name: 'TaskDefender AI', description: 'Your witty productivity assistant' },
    { id: 'mom', name: 'Concerned Mom', description: 'Loving but disappointed maternal figure' },
    { id: 'coach', name: 'Motivational Coach', description: 'Intense motivational speaker' },
    { id: 'custom', name: 'Custom Assistant', description: 'Your personalized assistant' }
  ];

  const voiceOptions = [
    { id: 'en-US-female', name: 'American English (Female)' },
    { id: 'en-US-male', name: 'American English (Male)' },
    { id: 'en-GB-female', name: 'British English (Female)' },
    { id: 'en-GB-male', name: 'British English (Male)' },
    { id: 'en-AU-female', name: 'Australian English (Female)' },
    { id: 'en-AU-male', name: 'Australian English (Male)' },
    { id: 'custom', name: 'Custom Voice Recording' }
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
      case 5:
        return true; // Voice calls are optional
      case 6:
        return true; // Task defense settings
      case 7:
        return formData.role !== 'admin' || (
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
          {step === 1 && (
            <div className="text-center">
              <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center">
                <Logo size="md" className="text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to TaskDefender
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Your Last Line of Defense Against Procrastination
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
                Select all that apply to personalize your TaskDefender experience
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
                How do you prefer to work and defend against procrastination?
              </p>
              
              <div className="space-y-4 mb-8">
                {workStyleOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateFormData({ workStyle: style.id })}
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

          {step === 5 && (
            <div>
              <div className="text-center mb-6">
                <div className="bg-green-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                  <PhoneCall className="h-10 w-10 text-green-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Voice Call Defense System
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Set up motivational voice calls to defend against procrastination
                </p>
              </div>

              <div className="space-y-6">
                {/* Enable Voice Calls */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Enable Voice Calls</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow characters to call you with motivation</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.enableVoiceCalls}
                      onChange={(e) => updateFormData({ enableVoiceCalls: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {formData.enableVoiceCalls && (
                  <>
                    {/* Call Interval */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Call Interval (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={formData.voiceCallInterval}
                        onChange={(e) => updateFormData({ voiceCallInterval: parseInt(e.target.value) || 30 })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>

                    {/* Character Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Choose Your Defense Character
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {voiceCharacters.map(character => (
                          <button
                            key={character.id}
                            onClick={() => updateFormData({ selectedCharacter: character.id })}
                            className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                              formData.selectedCharacter === character.id
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
                            }`}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white">{character.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{character.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Assistant Setup */}
                    {formData.selectedCharacter === 'custom' && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-4">
                          Custom Assistant Setup
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Assistant Name
                            </label>
                            <input
                              type="text"
                              value={formData.customCharacterName}
                              onChange={(e) => updateFormData({ customCharacterName: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                              placeholder="Enter custom name"
                            />
                          </div>

                          {/* Custom Prompts */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Motivational Prompts
                            </label>
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={newPrompt}
                                  onChange={(e) => setNewPrompt(e.target.value)}
                                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                  placeholder="Add a motivational prompt"
                                />
                                <button
                                  onClick={addCustomPrompt}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                >
                                  Add
                                </button>
                              </div>

                              {formData.customPrompts.length > 0 && (
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {formData.customPrompts.map((prompt, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg">
                                      <span className="text-sm text-gray-700 dark:text-gray-300">{prompt}</span>
                                      <button
                                        onClick={() => removePrompt(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Voice Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Voice Selection
                      </label>
                      <select
                        value={formData.selectedVoice}
                        onChange={(e) => updateFormData({ selectedVoice: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                      >
                        {voiceOptions.map(voice => (
                          <option key={voice.id} value={voice.id}>{voice.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Voice Recording */}
                    {formData.selectedVoice === 'custom' && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-4">
                          Record Your Voice
                        </h4>
                        
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                              isRecording
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                          >
                            <Mic className="h-4 w-4" />
                            <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                          </button>
                          
                          {customVoiceBlob && (
                            <span className="text-sm text-green-600 dark:text-green-400">
                              ✓ Voice recorded successfully
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                          Record a sample phrase (max 10 seconds) for voice synthesis
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <div className="text-center mb-6">
                <div className="bg-orange-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                  <Shield className="h-10 w-10 text-orange-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Task Defense System
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Configure your last line of defense against procrastination
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'enableTaskDefense',
                    title: 'Enable Task Defense',
                    description: 'Activate the complete TaskDefender system',
                    icon: Shield
                  },
                  {
                    key: 'honestyCheckpoints',
                    title: 'Honesty Checkpoints',
                    description: 'Verify task completion integrity before marking as done',
                    icon: CheckCircle
                  },
                  {
                    key: 'criticalTaskAlerts',
                    title: 'Critical Task Alerts',
                    description: 'Get alerts for tasks approaching deadlines',
                    icon: Zap
                  },
                  {
                    key: 'procrastinationDefense',
                    title: 'Procrastination Defense',
                    description: 'AI-powered interventions to keep you on track',
                    icon: Target
                  }
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <setting.icon className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{setting.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData[setting.key as keyof FormData] as boolean}
                        onChange={(e) => updateFormData({ [setting.key]: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl">
                <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
                  🛡️ Your Last Line of Defense
                </h4>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  TaskDefender will monitor your tasks, detect procrastination patterns, and intervene with motivational calls, 
                  honesty checkpoints, and critical task alerts to keep you productive and accountable.
                </p>
              </div>
            </div>
          )}

          {step === 7 && formData.role === 'admin' && (
            <div>
              <div className="text-center mb-6">
                <div className="bg-blue-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                  <Building className="h-10 w-10 text-blue-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Organization Details
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Set up your organization for team productivity defense
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
                    Your Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.userRoleInOrg}
                    onChange={(e) => updateFormData({ userRoleInOrg: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    placeholder="e.g., CEO, Manager, Developer"
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