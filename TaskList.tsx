import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  MoreHorizontal,
  Play,
  Pause,
  AlertTriangle,
  Eye,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSarcasticPrompts } from '../../hooks/useSarcasticPrompts';
import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onStartFocus: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdateTask, onStartFocus }) => {
  const [showHonestyCheck, setShowHonestyCheck] = useState(false);
  const { getTaskAnalysis } = useSarcasticPrompts();
  
  const analysis = getTaskAnalysis(task.id);

  const priorityColors = {
    low: 'border-l-blue-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500',
  };

  const statusColors = {
    todo: 'text-gray-500',
    'in-progress': 'text-orange-500',
    blocked: 'text-red-500',
    done: 'text-green-500',
  };

  const urgencyColors = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  };

  const handleComplete = (honestlyCompleted: boolean) => {
    onUpdateTask(task.id, {
      status: 'done',
      completedAt: new Date(),
      honestlyCompleted,
    });
    setShowHonestyCheck(false);
  };

  const toggleStatus = () => {
    if (task.status === 'done') {
      onUpdateTask(task.id, { status: 'todo', completedAt: undefined });
    } else if (task.status === 'todo') {
      setShowHonestyCheck(true);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  
  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 ${priorityColors[task.priority]} shadow-sm hover:shadow-md transition-all duration-200 p-4`}>
        <div className="flex items-start space-x-3">
          <button
            onClick={toggleStatus}
            className="mt-1 flex-shrink-0"
          >
            {task.status === 'done' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors duration-200" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className={`font-medium transition-all duration-200 ${
                task.status === 'done' 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>
              
              <div className="flex items-center space-x-2 ml-2">
                {isOverdue && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                
                {analysis && analysis.urgencyLevel === 'critical' && (
                  <Zap className="h-4 w-4 text-red-500 animate-pulse" />
                )}
                
                <button
                  onClick={() => onStartFocus(task.id)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Start focus session"
                >
                  <Play className="h-4 w-4 text-gray-500 hover:text-orange-500" />
                </button>
                
                <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {task.description}
              </p>
            )}

            {/* Task Analysis Display */}
            {analysis && task.status !== 'done' && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Task Analysis</span>
                  <span className={`text-xs font-bold ${urgencyColors[analysis.urgencyLevel]}`}>
                    {analysis.urgencyLevel.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Time Remaining:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {formatTimeRemaining(analysis.timeRemaining)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Procrastination Risk:</span>
                    <span className={`ml-1 font-medium ${
                      analysis.procrastinationRisk > 70 ? 'text-red-500' :
                      analysis.procrastinationRisk > 40 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {Math.round(analysis.procrastinationRisk)}%
                    </span>
                  </div>
                  
                  {analysis.timeUtilization > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Time Utilization:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        {Math.round(analysis.timeUtilization)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {analysis.recommendedAction && (
                  <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs">
                    <span className="font-medium text-orange-700 dark:text-orange-400">
                      💡 {analysis.recommendedAction}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Work Pattern Display */}
            {task.workPattern && task.workPattern.totalTimeSpent > 0 && (
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{task.workPattern.sessionsCount} sessions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{Math.round(task.workPattern.totalTimeSpent)}min total</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>{Math.round(task.workPattern.averageSessionLength)}min avg</span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className={`px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                {task.status.replace('-', ' ').toUpperCase()}
              </span>
              
              <span className="capitalize">{task.priority}</span>
              
              {task.estimatedTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedTime}min</span>
                </div>
              )}
              
              {task.dueDate && (
                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-500' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Time Blocks Preview */}
            {task.timeBlocks && task.timeBlocks.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Scheduled blocks: </span>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {task.timeBlocks.filter(block => block.isScheduled).length} of {task.timeBlocks.length}
                </span>
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Honesty Check Modal */}
      {showHonestyCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                <Eye className="h-10 w-10 text-orange-500 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Honesty Checkpoint
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Did you really complete this task honestly and thoroughly?
              </p>
              
              {analysis && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    You spent {task.workPattern?.totalTimeSpent || 0} minutes on this task
                    {task.estimatedTime && ` (estimated: ${task.estimatedTime} minutes)`}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleComplete(true)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                Yes, I completed it honestly
              </button>
              
              <button
                onClick={() => handleComplete(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                I need to be more honest
              </button>
              
              <button
                onClick={() => setShowHonestyCheck(false)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TaskList: React.FC = () => {
  const { tasks, updateTask, startFocusSession } = useApp();
  const { getCriticalTasks, getProcrastinatingTasks } = useSarcasticPrompts();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done' | 'critical' | 'procrastinating'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'priority' | 'urgency'>('created');

  const criticalTasks = getCriticalTasks();
  const procrastinatingTasks = getProcrastinatingTasks();

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'all': return true;
      case 'critical': return criticalTasks.some(ct => ct.id === task.id);
      case 'procrastinating': return procrastinatingTasks.some(pt => pt.id === task.id);
      default: return task.status === filter;
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'due':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'urgency':
        // Sort by critical tasks first, then by due date
        const aIsCritical = criticalTasks.some(ct => ct.id === a.id);
        const bIsCritical = criticalTasks.some(ct => ct.id === b.id);
        if (aIsCritical && !bIsCritical) return -1;
        if (!aIsCritical && bIsCritical) return 1;
        // Then by due date
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'critical', label: 'Critical', count: criticalTasks.length },
    { value: 'procrastinating', label: 'At Risk', count: procrastinatingTasks.length },
    { value: 'todo', label: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { value: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { value: 'done', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Tasks
        </h2>

        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="created">Sort by Created</option>
            <option value="due">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="urgency">Sort by Urgency</option>
          </select>
        </div>
      </div>

      {/* Smart Alerts */}
      {(criticalTasks.length > 0 || procrastinatingTasks.length > 0) && (
        <div className="space-y-3">
          {criticalTasks.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-semibold text-red-700 dark:text-red-400">
                  🚨 {criticalTasks.length} Critical Task{criticalTasks.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                These tasks need immediate attention to avoid missing deadlines!
              </p>
            </div>
          )}
          
          {procrastinatingTasks.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                  ⚠️ {procrastinatingTasks.length} Task{procrastinatingTasks.length !== 1 ? 's' : ''} at Risk
                </span>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                High procrastination risk detected. Consider breaking these into smaller chunks.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === option.value
                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {option.label}
            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
              option.value === 'critical' && option.count > 0 ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300' :
              option.value === 'procrastinating' && option.count > 0 ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
              'bg-gray-200 dark:bg-gray-600'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No tasks yet' : `No ${filter.replace('-', ' ')} tasks`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? 'Add your first task to get started' 
                : `All your ${filter.replace('-', ' ')} tasks will appear here`
              }
            </p>
          </div>
        ) : (
          sortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdateTask={updateTask}
              onStartFocus={startFocusSession}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;