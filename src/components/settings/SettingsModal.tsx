import React, { useState } from 'react';
import { 
  X,
  User, 
  Wallet,
  Bell,
  Shield,
  Moon,
  Sun,
  Save,
  Key,
  Plus,
  MessageCircle,
  Database,
  Monitor,
  Brain,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSarcasticPrompts } from '../../hooks/useSarcasticPrompts';
import DataPrivacySettings from './DataPrivacySettings';
import MonitoringDashboard from '../monitoring/MonitoringDashboard';
import SmartInterventionSystem from '../ai/SmartInterventionSystem';
import SocialMediaIntegration from '../analytics/SocialMediaIntegration';
import NotificationScheduler from '../notifications/NotificationScheduler';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, theme, setTheme } = useApp();
  const { userPersona, changePersona, availablePersonas, generateNudge, generateRoast } = useSarcasticPrompts();
  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'wallet' | 'notifications' | 'security' | 'sarcasm' | 'privacy' | 'monitoring' | 'ai-interventions'>('profile');
  const [walletData, setWalletData] = useState({
    hasWallet: !!user?.walletAddress,
    walletAddress: user?.walletAddress || '',
    backupPhrase: '',
    isCreatingNew: false,
  });

  if (!isOpen) return null;

  const handleCreateWallet = () => {
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
    { id: 'social', label: 'Social Media', icon: MessageCircle },
    { id: 'sarcasm', label: 'Sarcasm Engine', icon: MessageCircle },
    { id: 'monitoring', label: 'Advanced Monitoring', icon: Monitor },
    { id: 'ai-interventions', label: 'AI Interventions', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Data & Privacy', icon: Database },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const personaDescriptions = {
    'default': 'Classic sarcastic AI with witty observations',
    'gordon': 'Gordon Ramsay-style intense motivation with colorful language',
    'mom': 'Loving but disappointed maternal figure',
    'hr': 'Corporate buzzword-heavy professional speak',
    'passive-aggressive': 'Subtly judgmental with backhanded compliments'
  };

  // Handle back navigation properly for social media
  const handleBackFromSocial = () => {
    setActiveTab('profile');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {/* Add back button for social media */}
            {activeTab === 'social' && (
              <button
                onClick={handleBackFromSocial}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'privacy' && <DataPrivacySettings />}
            {activeTab === 'monitoring' && <MonitoringDashboard />}
            {activeTab === 'ai-interventions' && <SmartInterventionSystem />}
            {activeTab === 'notifications' && <NotificationScheduler />}
            
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Social Media Integration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Connect your social media accounts to easily share your productivity achievements.
                  </p>
                </div>

                {/* Social Media Integration with proper back button handling */}
                <SocialMediaIntegration
                  isOpen={true}
                  onClose={handleBackFromSocial}
                  shareText="🎯 Productivity Update! Making great progress with TaskDefender! #ProductivityJourney"
                />
              </div>
            )}
            
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
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
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

            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-blue-500 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Algorand Wallet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Connect your Algorand wallet for blockchain features
                  </p>
                </div>

                {!walletData.hasWallet ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={handleCreateWallet}
                        className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl hover:shadow-md transition-all duration-200"
                      >
                        <Plus className="h-8 w-8 text-green-500 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Create New Wallet</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generate a new Algorand wallet with backup phrase
                        </p>
                      </button>

                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                        <Key className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Import Existing Wallet</h4>
                        <textarea
                          placeholder="Enter your 12-word backup phrase"
                          value={walletData.backupPhrase}
                          onChange={(e) => setWalletData(prev => ({ ...prev, backupPhrase: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                          rows={3}
                        />
                        <button
                          onClick={handleImportWallet}
                          disabled={!walletData.backupPhrase.trim()}
                          className="w-full mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Import Wallet
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-green-700 dark:text-green-400">Wallet Connected</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Wallet Address
                          </label>
                          <code className="block w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-900 dark:text-white border">
                            {walletData.walletAddress}
                          </code>
                        </div>
                        
                        {walletData.backupPhrase && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                            <h5 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                              ⚠️ Backup Phrase (Save Securely!)
                            </h5>
                            <code className="block text-sm font-mono text-yellow-800 dark:text-yellow-300">
                              {walletData.backupPhrase}
                            </code>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                              Store this phrase safely. You'll need it to recover your wallet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Wallet Features</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Secure task completion verification</li>
                        <li>• Decentralized team productivity tracking</li>
                        <li>• Blockchain-based achievement rewards</li>
                        <li>• Cross-platform data synchronization</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Security Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Manage your account security and privacy
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Integrity Score</h4>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600 dark:text-gray-400">Current Score</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {user?.integrityScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${user?.integrityScore}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Your integrity score reflects your honesty in task completion
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                      Data Privacy
                    </h4>
                    <p className="text-sm text-orange-600 dark:text-orange-300 mb-4">
                      Your productivity data is encrypted and stored securely. You maintain full control over your information.
                    </p>
                    <ul className="text-sm text-orange-600 dark:text-orange-300 space-y-1">
                      <li>• End-to-end encryption for all data</li>
                      <li>• No third-party data sharing</li>
                      <li>• You can export or delete your data anytime</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;