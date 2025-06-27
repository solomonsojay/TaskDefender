import React from 'react';
import { Target, Clock, Users } from 'lucide-react';

interface WorkStyleData {
  workStyle: 'focused' | 'flexible' | 'collaborative';
  focusSessionLength: number;
  breakLength: number;
}

interface WorkStyleFormProps {
  data: WorkStyleData;
  onChange: (updates: Partial<WorkStyleData>) => void;
}

const WorkStyleForm: React.FC<WorkStyleFormProps> = ({ data, onChange }) => {
  const workStyleOptions = [
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-orange-500/20 p-3 rounded-full w-12 h-12 mx-auto mb-4">
          <Clock className="h-6 w-6 text-orange-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Work Style Preference
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          How do you prefer to work and defend against procrastination?
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {workStyleOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange({ workStyle: option.id })}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              data.workStyle === option.id
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${
                data.workStyle === option.id
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Focus Session Length (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            value={data.focusSessionLength}
            onChange={(e) => onChange({ focusSessionLength: parseInt(e.target.value) || 25 })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Break Length (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={data.breakLength}
            onChange={(e) => onChange({ breakLength: parseInt(e.target.value) || 5 })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
          />
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
        <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
          Productivity Tip
        </h4>
        <p className="text-sm text-orange-600 dark:text-orange-300">
          The Pomodoro Technique suggests 25-minute focus sessions with 5-minute breaks. Experiment to find what works best for you!
        </p>
      </div>
    </div>
  );
};

export default WorkStyleForm;