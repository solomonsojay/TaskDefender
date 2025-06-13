import React, { useState } from 'react';
import { 
  Plus, 
  Mic, 
  Clock, 
  Calendar,
  Tag,
  Send,
  Sparkles,
  Target,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { workPatternAnalyzer } from '../../services/WorkPatternAnalyzer';

const QuickTaskCapture: React.FC = () => {
  const { addTask } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedTime: 60,
    tags: [] as string[],
    dueDate: '',
    startDate: '',
  });

  const [isListening, setIsListening] = useState(false);
  const [suggestions] = useState([
    'Review project proposal',
    'Schedule team meeting',
    'Update documentation',
    'Prepare presentation',
    'Send follow-up emails',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    // Generate smart scheduling suggestions
    const mockTask = {
      ...taskData,
      id: 'temp',
      createdAt: new Date(),
      userId: 'temp',
      status: 'todo' as const,
    };

    const schedulingSuggestions = workPatternAnalyzer.generateSchedulingSuggestions(mockTask);

    addTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: 'todo',
      estimatedTime: taskData.estimatedTime,
      tags: taskData.tags,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
      timeBlocks: schedulingSuggestions,
      workPattern: {
        totalTimeSpent: 0,
        sessionsCount: 0,
        averageSessionLength: 0,
        productiveHours: [],
        procrastinationScore: 0,
        consistencyScore: 100
      }
    });

    // Reset form
    setTaskData({
      title: '',
      description: '',
      priority: 'medium',
      estimatedTime: 60,
      tags: [],
      dueDate: '',
      startDate: '',
    });
    setIsExpanded(false);
  };

  const handleVoiceCapture = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setTaskData(prev => ({ 
          ...prev, 
          title: 'Voice captured task example' 
        }));
        setIsListening(false);
      }, 2000);
    }
  };

  const addTag = (tag: string) => {
    if (!taskData.tags.includes(tag)) {
      setTaskData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, tag] 
      }));
    }
  };

  const removeTag = (tag: string) => {
    setTaskData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(t => t !== tag) 
    }));
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  // Calculate urgency warning
  const getUrgencyWarning = () => {
    if (!taskData.dueDate || !taskData.estimatedTime) return null;
    
    const dueDate = new Date(taskData.dueDate);
    const now = new Date();
    const timeRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60); // minutes
    const estimatedTime = taskData.estimatedTime;
    
    if (timeRemaining < estimatedTime) {
      return {
        type: 'error',
        message: `⚠️ Warning: You need ${estimatedTime} minutes but only have ${Math.round(timeRemaining)} minutes until deadline!`
      };
    } else if (timeRemaining < estimatedTime * 1.5) {
      return {
        type: 'warning',
        message: `⏰ Tight schedule: Consider starting immediately or reducing scope.`
      };
    }
    
    return null;
  };

  const urgencyWarning = getUrgencyWarning();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Plus className="h-5 w-5 text-orange-500" />
          <span>Quick Task Capture</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVoiceCapture}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isListening 
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 animate-pulse' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400'
            }`}
            title="Voice capture"
          >
            <Mic className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
          >
            {isExpanded ? 'Simple' : 'Detailed'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div className="relative">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={taskData.title}
            onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
          />
          
          {isListening && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Smart Suggestions */}
        {taskData.title === '' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Sparkles className="h-4 w-4" />
              <span>Quick suggestions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setTaskData(prev => ({ ...prev, title: suggestion }))}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Form */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Description */}
            <textarea
              placeholder="Add description (optional)"
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 resize-none"
              rows={3}
            />

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
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={taskData.estimatedTime}
                    onChange={(e) => setTaskData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    min="5"
                    step="5"
                  />
                </div>
              </div>
            </div>

            {/* Start Date and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date (optional)
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={taskData.startDate}
                    onChange={(e) => setTaskData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date (optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Urgency Warning */}
            {urgencyWarning && (
              <div className={`p-4 rounded-xl border ${
                urgencyWarning.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
              }`}>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{urgencyWarning.message}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {taskData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-orange-500 hover:text-orange-700 dark:hover:text-orange-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        addTag(input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <Tag className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[taskData.priority]}`}>
              {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}
            </span>
            {taskData.estimatedTime > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ~{taskData.estimatedTime}min
              </span>
            )}
            {taskData.dueDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Due: {new Date(taskData.dueDate).toLocaleDateString()}
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