import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Wallet,
  Bell,
  Shield,
  Moon,
  Sun,
  Smartphone,
  Save,
  Key,
  Plus,
  MessageCircle,
  Volume2,
  Database
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSarcasticPrompts } from '../../hooks/useSarcasticPrompts';
import DataPrivacySettings from './DataPrivacySettings';

const Settings: React.FC = () => {
  const { user, theme, setTheme } = useApp();
  const { userPersona, changePersona, availablePersonas, generateNudge, generateRoast } = useSarcasticPrompts();
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'notifications' | 'security' | 'sarcasm' | 'privacy'>('profile');
  const [walletData, setWalletData] = useState({
    hasWallet: !!user?.walletAddress,
    walletAddress: user?.walletAddress || '',
    backupPhrase: '',
    isCreatingNew: false,
  });
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    focusMode: true,
    dailySummary: true,
    teamUpdates: true,
    sarcasticPrompts: true,
  });

  const handleCreateWallet = () => {
    // Mock wallet creation
    const mockAddress = 'ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZAB5678';
    const mockPhrase = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
    
    setWalletData({
      hasWallet: true,
      walletAddress: mockAddress,
      backupPhrase: mockPhrase,
      isCreatingNew: false,
    });
  };

  const handleImportWallet = () => {
    if (walletData.backupPhrase.trim().split(' ').length >= 12) {
      const mockAddress = 'IMPORTED1234EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZAB5678';
      setWalletData(prev => ({
        ...prev,
        hasWallet: true,
        walletAddress: mockAddress,
        backupPhrase: '',
      }));
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'sarcasm', label: 'Sarcasm Engine', icon: MessageCircle },
    { id: 'privacy', label: 'Data & Privacy', icon: Database },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const personaDescriptions = {
    'default': 'Classic sarcastic AI with witty observations',
    'gordon': 'Gordon Ramsay-style intense motivation with colorful language',
    'mom': 'Loving but disappointed maternal figure',
    'hr': 'Corporate buzzword-heavy professional speak',
    'passive-aggressive': 'Subtly judgmental with backhanded compliments'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500/20 p-3 rounded-xl">
              <SettingsIcon className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'privacy' && <DataPrivacySettings />}
          
          {activeTab === 'sarcasm' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Sarcasm Engine Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Customize your TaskDefender's personality and motivation style
                </p>
              </div>

              {/* Current Persona */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6">
                <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-4">
                  Current Personality: {userPersona.charAt(0).toUpperCase() + userPersona.slice(1).replace('-', ' ')}
                </h4>
                <p className="text-sm text-orange-600 dark:text-orange-300 mb-4">
                  {personaDescriptions[userPersona as keyof typeof personaDescriptions]}
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={generateNudge}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Test Nudge</span>
                  </button>
                  
                  <button
                    onClick={generateRoast}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Test Roast</span>
                  </button>
                </div>
              </div>

              {/* Persona Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Choose Your Motivational Style</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePersonas.map(persona => (
                    <button
                      key={persona}
                      onClick={() => changePersona(persona)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        userPersona === persona
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                      }`}
                    >
                      <h5 className="font-semibold text-gray-900 dark:text-white capitalize mb-2">
                        {persona.replace('-', ' ')}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {personaDescriptions[persona as keyof typeof personaDescriptions]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Frequency */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Prompt Settings</h4>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Sarcastic Prompts</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enable motivational nudges and roasts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.sarcasticPrompts}
                        onChange={(e) => setNotifications(prev => ({ ...prev, sarcasticPrompts: e.target.checked }))}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>• Gentle nudges after 30 minutes of inactivity</p>
                    <p>• Medium roasts after 1 hour of procrastination</p>
                    <p>• Savage motivation after 2+ hours of avoidance</p>
                    <p>• Celebration messages when you complete tasks</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-500">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                      {user?.role === 'admin' ? 'Team Admin' : 'User'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Personal Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Preferences</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                          theme === 'light'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                        }`}
                      >
                        <Sun className="h-4 w-4" />
                        <span className="text-sm">Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                          theme === 'dark'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                        }`}
                      >
                        <Moon className="h-4 w-4" />
                        <span className="text-sm">Dark</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Work Style
                    </label>
                    <select
                      defaultValue={user?.workStyle}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    >
                      <option value="focused">Deep Focus</option>
                      <option value="flexible">Flexible</option>
                      <option value="collaborative">Collaborative</option>
                    </select>
                  </div>
                </div>
              </div>

              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}

          {/* Other tab content would go here */}
        </div>
      </div>
    </div>
  );
};

export default Settings;