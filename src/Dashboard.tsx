import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Play,
  Calendar,
  AlertTriangle,
  Award,
  Shield,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { user, tasks, addTask, startFocusSession } = useApp();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Force re-render when tasks change to ensure dashboard updates
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [tasks]);

  // Memoize task lists to prevent unnecessary recalculations
  const { completedTasks, inProgressTasks, todoTasks, criticalTasks, atRiskTasks, overdueTasks } = useMemo(() => {
    return {
      completedTasks: tasks.filter(task => task.status === 'done'),
      inProgressTasks: tasks.filter(task => task.status === 'in-progress'),
      todoTasks: tasks.filter(task => task.status === 'todo'),
      
      // Find critical tasks (50% close to deadline)
      criticalTasks: tasks.filter(task => {
        if (!task.dueDate || task.status === 'done') return false;
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const createdDate = new Date(task.createdAt);
        const totalTimespan = dueDate.getTime() - createdDate.getTime();
        const elapsedTime = now.getTime() - createdDate.getTime();
        const timeProgress = elapsedTime / totalTimespan;
        
        // Critical if 50% or more time has passed
        return timeProgress >= 0.5 && timeProgress < 0.85;
      }),

      // Find at-risk tasks (85% close to deadline)
      atRiskTasks: tasks.filter(task => {
        if (!task.dueDate || task.status === 'done') return false;
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const createdDate = new Date(task.createdAt);
        const totalTimespan = dueDate.getTime() - createdDate.getTime();
        const elapsedTime = now.getTime() - createdDate.getTime();
        const timeProgress = elapsedTime / totalTimespan;
        
        // At risk if 85% or more time has passed
        return timeProgress >= 0.85;
      }),

      // Find overdue tasks
      overdueTasks: tasks.filter(task => {
        if (!task.dueDate || task.status === 'done') return false;
        return new Date(task.dueDate) < new Date();
      })
    };
  }, [tasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTask({
        title: newTaskTitle,
        description: '',
        priority: newTaskPriority as any,
        status: 'todo',
        tags: [],
        dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
      });

      setNewTaskTitle('');
      setNewTaskDueDate('');
      setNewTaskPriority('medium');
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  const getTaskProgress = (task: any) => {
    if (!task.dueDate || task.status === 'done') return 0;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    const totalTime = dueDate.getTime() - createdDate.getTime();
    const elapsedTime = now.getTime() - createdDate.getTime();
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  };

  const isOverdue = (task: any) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  };

  const isCritical = (task: any) => {
    return criticalTasks.includes(task);
  };

  const isAtRisk = (task: any) => {
    return atRiskTasks.includes(task);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-green-500 rounded-2xl text-white p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-orange-100 mb-4">
          Your Last Line of Defense Against Procrastination
        </p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-yellow-300" />
            <span className="font-medium">🔥 {user?.streak} day streak</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-300" />
            <span className="font-medium">✅ {user?.integrityScore}% integrity</span>
          </div>
          {overdueTasks.length > 0 && (
            <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-200 animate-pulse" />
              <span className="font-medium text-red-200">{overdueTasks.length} overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Task Capture */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Task Capture
        </h2>
        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              disabled={isSubmitting}
            />
            
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="md:w-40 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              disabled={isSubmitting}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="md:w-40 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newTaskTitle.trim() || isSubmitting}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            <span>{isSubmitting ? 'Adding...' : 'Add Task'}</span>
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {completedTasks.length}
            </div>
          </div>
          <h3 className="font-medium text-green-700 dark:text-green-400">
            Completed
          </h3>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {inProgressTasks.length}
            </div>
          </div>
          <h3 className="font-medium text-orange-700 dark:text-orange-400">
            In Progress
          </h3>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {todoTasks.length}
            </div>
          </div>
          <h3 className="font-medium text-blue-700 dark:text-blue-400">
            To Do
          </h3>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-500">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {criticalTasks.length}
            </div>
          </div>
          <h3 className="font-medium text-red-700 dark:text-red-400">
            Critical
          </h3>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {atRiskTasks.length}
            </div>
          </div>
          <h3 className="font-medium text-yellow-700 dark:text-yellow-400">
            At Risk
          </h3>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {user?.integrityScore || 100}%
            </div>
          </div>
          <h3 className="font-medium text-purple-700 dark:text-purple-400">
            Integrity
          </h3>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Tasks
        </h2>
        
        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No tasks yet. Add one to get started with TaskDefender protection!
              </p>
            </div>
          ) : (
            recentTasks.map(task => {
              const progress = getTaskProgress(task);
              
              return (
                <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-orange-500' :
                    isOverdue(task) ? 'bg-red-500' :
                    isAtRisk(task) ? 'bg-yellow-500' :
                    isCritical(task) ? 'bg-red-400' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      task.status === 'done' 
                        ? 'text-gray-500 dark:text-gray-400 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                      {task.isDefenseActive && (
                        <span title="Defense Active" className="ml-2">
                          <Shield className="inline h-3 w-3 text-orange-500" />
                        </span>
                      )}
                    </p>
                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 text-xs ${
                        isOverdue(task) ? 'text-red-500' :
                        isAtRisk(task) ? 'text-yellow-500' :
                        isCritical(task) ? 'text-red-400' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        {isOverdue(task) && <span className="text-red-500 font-medium">Overdue!</span>}
                        {isAtRisk(task) && <span className="text-yellow-500 font-medium">At Risk!</span>}
                        {isCritical(task) && !isAtRisk(task) && <span className="text-red-400 font-medium">Critical!</span>}
                      </div>
                    )}
                    
                    {/* Progress Bar for Active Tasks */}
                    {task.status !== 'done' && task.dueDate && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full transition-all duration-300 ${
                              progress >= 85 ? 'bg-red-500' :
                              progress >= 50 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {task.priority}
                  </span>
                  {task.status !== 'done' && (
                    <button
                      onClick={() => startFocusSession(task.id)}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                      title="Start focus session"
                    >
                      <Play className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;