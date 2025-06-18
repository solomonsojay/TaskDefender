import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Send,
  Target,
  AlertCircle,
  Lightbulb,
  Clock,
  Zap
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const QuickTaskCapture: React.FC = () => {
  const { addTask } = useApp();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedTime: 60,
    tags: [] as string[],
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Smart suggestions based on input
  const taskSuggestions = [
    'Review project documentation',
    'Update team on progress',
    'Schedule client meeting',
    'Complete code review',
    'Write unit tests',
    'Update project timeline',
    'Research new technologies',
    'Prepare presentation slides',
    'Send follow-up emails',
    'Organize project files',
    'Plan next sprint',
    'Update user documentation',
    'Test new features',
    'Backup important data',
    'Review and respond to feedback'
  ];

  useEffect(() => {
    if (taskData.title.length > 2) {
      const filtered = taskSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(taskData.title.toLowerCase()) ||
        taskData.title.toLowerCase().split(' ').some(word => 
          suggestion.toLowerCase().includes(word) && word.length > 2
        )
      );
      setSuggestions(filtered.slice(0, 3));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [taskData.title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    addTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: 'todo',
      estimatedTime: taskData.estimatedTime,
      tags: taskData.tags,
    });

    // Reset form
    setTaskData({
      title: '',
      description: '',
      priority: 'medium',
      estimatedTime: 60,
      tags: [],
    });
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTaskData(prev => ({ ...prev, title: suggestion }));
    setShowSuggestions(false);
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  const priorityIcons = {
    low: Clock,
    medium: Target,
    high: AlertCircle,
    urgent: Zap,
  };

  const PriorityIcon = priorityIcons[taskData.priority];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Plus className="h-5 w-5 text-orange-500" />
          <span>Quick Task Capture</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title with Suggestions */}
        <div className="relative">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={taskData.title}
            onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
          />
          
          {/* Smart Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10">
              <div className="p-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  <Lightbulb className="h-3 w-3" />
                  <span>Smart Suggestions</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Priority and Estimated Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={taskData.priority}
              onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              value={taskData.estimatedTime}
              onChange={(e) => setTaskData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              min="5"
              step="5"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${priorityColors[taskData.priority]}`}>
              <PriorityIcon className="h-3 w-3" />
              <span>{taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}</span>
            </span>
            {taskData.estimatedTime > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>~{taskData.estimatedTime}min</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!taskData.title.trim()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickTaskCapture;