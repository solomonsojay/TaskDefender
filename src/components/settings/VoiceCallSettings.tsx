import React, { useState } from 'react';
import { PhoneCall, Volume2, Settings } from 'lucide-react';

const VoiceCallSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    enableCalls: true,
    callFrequency: 'normal' as 'low' | 'normal' | 'high',
    selectedCharacter: 'default'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-500/20 p-3 rounded-xl">
          <PhoneCall className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Voice Call Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure motivational calls from different characters
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Call Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Enable Voice Calls</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow characters to call you with motivation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.enableCalls}
                onChange={(e) => setSettings(prev => ({ ...prev, enableCalls: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Call Frequency
            </label>
            <select
              value={settings.callFrequency}
              onChange={(e) => setSettings(prev => ({ ...prev, callFrequency: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="low">Low (Every 30 minutes)</option>
              <option value="normal">Normal (Every 20 minutes)</option>
              <option value="high">High (Every 10 minutes)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallSettings;