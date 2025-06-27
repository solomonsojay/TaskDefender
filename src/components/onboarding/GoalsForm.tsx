import React, { useState } from 'react';
import { Target, Plus, X, CheckCircle } from 'lucide-react';

interface GoalsData {
  goals: string[];
  weeklyTarget: number;
}

interface GoalsFormProps {
  data: GoalsData;
  onChange: (updates: Partial<GoalsData>) => void;
}

const GoalsForm: React.FC<GoalsFormProps> = ({ data, onChange }) => {
  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const updatedGoals = [...data.goals, newGoal.trim()];
      onChange({ goals: updatedGoals });
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = data.goals.filter((_, i) => i !== index);
    onChange({ goals: updatedGoals });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGoal();
    }
  };

  const suggestedGoals = [
    "Complete work tasks on time",
    "Reduce procrastination",
    "Improve focus during work hours",
    "Maintain a healthy work-life balance",
    "Learn a new skill",
    "Read more books",
    "Exercise regularly",
    "Finish personal projects"
  ];

  const addSuggestedGoal = (goal: string) => {
    if (!data.goals.includes(goal)) {
      const updatedGoals = [...data.goals, goal];
      onChange({ goals: updatedGoals });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-green-500/20 p-3 rounded-full w-12 h-12 mx-auto mb-4">
          <Target className="h-6 w-6 text-green-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Set Your Productivity Goals
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          What do you want to achieve with TaskDefender?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Your Goals
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter a productivity goal"
            />
            <button
              onClick={handleAddGoal}
              disabled={!newGoal.trim()}
              className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Goals List */}
        {data.goals.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Goals
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.goals.map((goal, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-800 dark:text-gray-200">{goal}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveGoal(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Suggested Goals
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedGoals.map((goal, index) => (
              <button
                key={index}
                onClick={() => addSuggestedGoal(goal)}
                disabled={data.goals.includes(goal)}
                className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                  data.goals.includes(goal)
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weekly Task Target
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={data.weeklyTarget}
            onChange={(e) => onChange({ weeklyTarget: parseInt(e.target.value) || 15 })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            How many tasks do you aim to complete each week?
          </p>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
          Goal Setting Tips
        </h4>
        <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
          <li>• Set specific, measurable goals</li>
          <li>• Start with realistic targets</li>
          <li>• Include both short-term and long-term goals</li>
          <li>• Focus on what matters most to you</li>
        </ul>
      </div>
    </div>
  );
};

export default GoalsForm;