import React from 'react';
import { User, AtSign, FileText } from 'lucide-react';

interface PersonalInfoData {
  name: string;
  username: string;
  bio: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfoData;
  onChange: (updates: Partial<PersonalInfoData>) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-blue-500/20 p-3 rounded-full w-12 h-12 mx-auto mb-4">
          <User className="h-6 w-6 text-blue-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us a bit about yourself
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              required
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username *
          </label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              required
              value={data.username}
              onChange={(e) => onChange({ username: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              placeholder="username"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Only letters, numbers, and underscores
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              value={data.bio}
              onChange={(e) => onChange({ bio: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 resize-none"
              rows={3}
              placeholder="Tell us a bit about yourself"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
          Privacy Note
        </h4>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          All your information is stored locally on your device. TaskDefender is committed to privacy-first design.
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoForm;