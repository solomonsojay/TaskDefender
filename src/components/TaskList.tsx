import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  Play,
  Trash2,
  AlertTriangle,
  Zap,
  Shield,
  Plus,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const TaskList: React.FC = () => {
  const { tasks, updateTask, deleteTask, startFocusSession, addTask } = useApp();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done' | 'critical' | 'at-risk'>('all');
  const [showHonestyCheck, setShowHonestyCheck] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: '',
    expectedCompletionTime: '',
    estimatedTime: 30,
    tags: [] as string[]
  });

  // Find critical tasks (80% close to deadline)
  const criticalTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    const totalTimespan = dueDate.getTime() - createdDate.getTime();
    const timeLeft = dueDate.getTime() - now.getTime();
    
    // If less than 20% of time remains, it's critical
    return timeLeft > 0 && (timeLeft / totalTimespan) <= 0.2;
  });

  // Find at-risk tasks (90% close to deadline)
  const atRiskTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    const totalTimespan = dueDate.getTime() - createdDate.getTime();
    const timeLeft = dueDate.getTime() - now.getTime();
    
    // If less than 10% of time remains, it's at risk
    return timeLeft > 0 && (timeLeft / totalTimespan) <= 0.1;
  });

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'critical') {
      const now = new Date();
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate = new Date(task.dueDate);
      const createdDate = new Date(task.createdAt);
      const totalTimespan = dueDate.getTime() - createdDate.getTime();
      const timeLeft = dueDate.getTime() - now.getTime();
      return timeLeft > 0 && (timeLeft / totalTimespan) <= 0.2;
    }
    if (filter === 'at-risk') {
      const now = new Date();
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate = new Date(task.dueDate);
      const createdDate = new Date(task.createdAt);
      const totalTimespan = dueDate.getTime() - createdDate.getTime();
      const timeLeft = dueDate.getTime() - now.getTime();
      return timeLeft > 0 && (timeLeft / totalTimespan) <= 0.1;
    }
    return task.status === filter;
  });

  const handleHonestyCheck = (taskId: string, honestlyCompleted: boolean) => {
    if (honestlyCompleted) {
      updateTask(taskId, {
        status: 'done',
        completedAt: new Date(),
        honestlyCompleted: true
      });
    } else {
      // If not honestly completed, keep as in-progress
      updateTask(taskId, {
        status: 'in-progress',
        honestlyCompleted: false
      });
    }
    setShowHonestyCheck(null);
  };

  const toggleTaskStatus = (taskId: string, currentStatus: string) => {
    if (currentStatus === 'done') {
      updateTask(taskId, { status: 'todo', completedAt: undefined, honestlyCompleted: undefined });
    } else if (currentStatus === 'todo') {
      // Show honesty check before completing
      setShowHonestyCheck(taskId);
    } else {
      // Show honesty check before completing
      setShowHonestyCheck(taskId);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'todo',
      tags: newTask.tags,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      expectedCompletionTime: newTask.expectedCompletionTime ? new Date(newTask.expectedCompletionTime) : undefined,
      estimatedTime: newTask.estimatedTime,
    });

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      expectedCompletionTime: '',
      estimatedTime: 30,
      tags: []
    });
    setShowTaskForm(false);
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'critical', label: 'Critical', count: criticalTasks.length },
    { value: 'at-risk', label: 'At Risk', count: atRiskTasks.length },
    { value: 'todo', label: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { value: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { value: 'done', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ];

  const isOverdue = (task: any) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  };

  const isCritical = (task: any) => {
    if (!task.dueDate || task.status === 'done') return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    const totalTimespan = dueDate.getTime() - createdDate.getTime();
    const timeLeft = dueDate.getTime() - now.getTime();
    return timeLeft > 0 && (timeLeft / totalTimespan) <= 0.2;
  };

  const isAtRisk = (task: any) => {
    if (!task.dueDate || task.status === 'done') return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    const totalTimespan = dueDate.getTime() - createdDate.getTime();
    const timeLeft = dueDate.getTime() - now.getTime();
    return timeLeft > 0 && (timeLeft / totalTimespan) <= 0.1;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Tasks
        </h2>
        <button
          onClick={() => setShowTaskForm(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Task
            </h3>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  placeholder="What needs to be done?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 resize-none"
                  rows={3}
                  placeholder="Task description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
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
                    Estimated Time (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Completion Time
                </label>
                <input
                  type="datetime-local"
                  value={newTask.expectedCompletionTime}
                  onChange={(e) => setNewTask(prev => ({ ...prev, expectedCompletionTime: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
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
              option.value === 'critical' ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300' :
              option.value === 'at-risk' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
              'bg-gray-200 dark:bg-gray-600'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
          filteredTasks.map(task => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-4">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
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
                      {isOverdue(task) && (
                        <span title="Overdue">
                          <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Overdue" />
                        </span>
                      )}
                      
                      {isAtRisk(task) && (
                        <span title="At Risk">
                          <Zap className="h-4 w-4 text-yellow-500 animate-pulse" aria-label="At Risk" />
                        </span>
                      )}
                      
                      {isCritical(task) && !isAtRisk(task) && (
                        <span title="Critical">
                          <AlertTriangle className="h-4 w-4 text-orange-500" aria-label="Critical" />
                        </span>
                      )}
                      
                      {task.status !== 'done' && (
                        <button
                          onClick={() => startFocusSession(task.id)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          title="Start focus session"
                        >
                          <Play className="h-4 w-4 text-gray-500 hover:text-orange-500" aria-label="Start focus session" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" aria-label="Delete task" />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-1 rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      task.status === 'in-progress' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {task.priority}
                    </span>
                    
                    {task.estimatedTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedTime}min</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 ${
                        isOverdue(task) ? 'text-red-500' :
                        isAtRisk(task) ? 'text-yellow-500' :
                        isCritical(task) ? 'text-orange-500' : ''
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        {isOverdue(task) && <span className="text-red-500 font-medium">Overdue!</span>}
                        {isAtRisk(task) && <span className="text-yellow-500 font-medium">At Risk!</span>}
                        {isCritical(task) && !isAtRisk(task) && <span className="text-orange-500 font-medium">Critical!</span>}
                      </div>
                    )}

                    {task.expectedCompletionTime && (
                      <div className="flex items-center space-x-1">
                        <span>Expected: {new Date(task.expectedCompletionTime).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

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
          ))
        )}
      </div>

      {/* Honesty Check Modal */}
      {showHonestyCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                <Shield className="h-10 w-10 text-orange-500 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Honesty Checkpoint
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Did you really complete this task honestly and thoroughly?
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                Your Last Line of Defense Against Procrastination
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleHonestyCheck(showHonestyCheck, true)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                Yes, I completed it honestly
              </button>
              
              <button
                onClick={() => handleHonestyCheck(showHonestyCheck, false)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                I need to be more honest
              </button>
              
              <button
                onClick={() => setShowHonestyCheck(null)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;