import React from 'react';
import { Bell, Volume2, Shield, MessageCircle } from 'lucide-react';

interface NotificationPreferencesData {
  enableNotifications: boolean;
  enableVoiceCalls: boolean;
  enableDefenseSystem: boolean;
  notificationFrequency: 'low' | 'medium' | 'high';
  preferredCharacter: 'default' | 'mom' | 'coach' | 'custom';
}

interface NotificationPreferencesFormProps {
  data: NotificationPreferencesData;
  onChange: (updates: Partial<NotificationPreferencesData>) => void;
}

const NotificationPreferencesForm: React.FC<NotificationPreferencesFormProps> = ({ data, onChange }) => {
  const characters = [
    { id: 'default', name: 'TaskDefender AI', description: 'Your witty productivity assistant' },
    { id: 'mom', name: 'Concerned Mom', description: 'Loving but disappointed maternal figure' },
    { id: 'coach', name: 'Motivational Coach', description: 'Intense motivational speaker' },
    { id: 'custom', name: 'Custom Assistant', description: 'Create your own character later' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-purple-500/20 p-3 rounded-full w-12 h-12 mx-auto mb-4">
          <Bell className="h-6 w-6 text-purple-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Notification Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize how TaskDefender helps you stay on track
        </p>
      </div>

      <div className="space-y-4">
        {/* Notification Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Bell className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Task Reminders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about upcoming deadlines</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={data.enableNotifications}
                onChange={(e) => onChange({ enableNotifications: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Volume2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Voice Calls</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Allow motivational voice interventions</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={data.enableVoiceCalls}
                onChange={(e) => onChange({ enableVoiceCalls: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Defense System</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activate anti-procrastination interventions</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={data.enableDefenseSystem}
                onChange={(e) => onChange({ enableDefenseSystem: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>

        {/* Notification Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notification Frequency
          </label>
          <select
            value={data.notificationFrequency}
            onChange={(e) => onChange({ notificationFrequency: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="low">Low (Fewer notifications)</option>
            <option value="medium">Medium (Balanced approach)</option>
            <option value="high">High (More frequent reminders)</option>
          </select>
        </div>

        {/* Character Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred Character
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {characters.map(character => (
              <button
                key={character.id}
                onClick={() => onChange({ preferredCharacter: character.id as any })}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  data.preferredCharacter === character.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    data.preferredCharacter === character.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{character.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{character.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
        <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">
          Notification Tips
        </h4>
        <ul className="text-sm text-purple-600 dark:text-purple-300 space-y-1">
          <li>• You can change these settings anytime in your profile</li>
          <li>• Voice calls use your browser's speech synthesis</li>
          <li>• The Defense System activates when tasks approach deadlines</li>
          <li>• All notifications are handled locally on your device</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationPreferencesForm;