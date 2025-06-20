import React, { useState } from 'react';
import { 
  X,
  User, 
  Bell,
  Moon,
  Sun,
  Save,
  Building,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import VoiceCallSettings from './VoiceCallSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, theme, setTheme, updateProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'notifications' | 'voice-calls'>('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    workStyle: user?.workStyle || 'focused',
  });
  const [orgData, setOrgData] = useState({
    organizationName: user?.organizationName || '',
    organizationType: user?.organizationType || '',
    organizationIndustry: user?.organizationIndustry || '',
    organizationSize: user?.organizationSize || '',
    userRoleInOrg: user?.userRoleInOrg || '',
    organizationWebsite: user?.organizationWebsite || '',
    organizationDescription: user?.organizationDescription || '',
  });

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    updateProfile(profileData);
    onClose();
  };

  const handleSaveOrganization = () => {
    updateProfile(orgData);
    onClose();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    ...(user?.role === 'admin' ? [{ id: 'organization', label: 'Organization', icon: Building }] : []),
    { id: 'voice-calls', label: 'Voice Calls', icon: PhoneCall },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
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
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-500">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
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
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
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
                        value={profileData.workStyle}
                        onChange={(e) => setProfileData({ ...profileData, workStyle: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      >
                        <option value="focused">Deep Focus</option>
                        <option value="flexible">Flexible</option>
                        <option value="collaborative">Collaborative</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}

            {activeTab === 'organization' && user?.role === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Organization Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Manage your organization information and settings
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={orgData.organizationName}
                      onChange={(e) => setOrgData({ ...orgData, organizationName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Type
                    </label>
                    <select
                      value={orgData.organizationType}
                      onChange={(e) => setOrgData({ ...orgData, organizationType: e.target.value })}
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
                      Industry
                    </label>
                    <select
                      value={orgData.organizationIndustry}
                      onChange={(e) => setOrgData({ ...orgData, organizationIndustry: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    >
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Size
                    </label>
                    <select
                      value={orgData.organizationSize}
                      onChange={(e) => setOrgData({ ...orgData, organizationSize: e.target.value })}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Role
                    </label>
                    <input
                      type="text"
                      value={orgData.userRoleInOrg}
                      onChange={(e) => setOrgData({ ...orgData, userRoleInOrg: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={orgData.organizationWebsite}
                      onChange={(e) => setOrgData({ ...orgData, organizationWebsite: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={orgData.organizationDescription}
                    onChange={(e) => setOrgData({ ...orgData, organizationDescription: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 resize-none"
                    rows={3}
                    placeholder="Brief description of your organization"
                  />
                </div>

                <button 
                  onClick={handleSaveOrganization}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}

            {activeTab === 'voice-calls' && (
              <VoiceCallSettings />
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Notification Preferences
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Manage how you receive notifications from TaskDefender
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'taskReminders', label: 'Task Reminders', description: 'Get notified about upcoming deadlines' },
                    { key: 'focusMode', label: 'Focus Mode', description: 'Notifications during focus sessions' },
                    { key: 'dailySummary', label: 'Daily Summary', description: 'End of day productivity summary' },
                    { key: 'teamUpdates', label: 'Team Updates', description: 'Updates from your team members' },
                    { key: 'voiceCalls', label: 'Voice Calls', description: 'Allow motivational voice calls' },
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{setting.label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={true}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  ))}
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