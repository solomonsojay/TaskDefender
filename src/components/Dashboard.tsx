import React, { useState } from 'react';
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

  const completedTasks = tasks.filter(task => task.status === 'done');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const todoTasks = tasks.filter(task => task.status === 'todo');
  
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

  // Find overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
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
  };

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
            />
            
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="md:w-40 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
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
            />
          </div>
          
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
            <span>Add Task</span>
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
                No tasks yet. Add one to get started!
              </p>
            </div>
          ) : (
            recentTasks.map(task => {
              // Check if task is critical or at risk
              const now = new Date();
              const dueDate = task.dueDate ? new Date(task.dueDate) : null;
              const createdDate = new Date(task.createdAt);
              
              let isCritical = false;
              let isAtRisk = false;
              
              if (dueDate && task.status !== 'done') {
                const totalTimespan = dueDate.getTime() - createdDate.getTime();
                const timeLeft = dueDate.getTime() - now.getTime();
                
                if (timeLeft > 0) {
                  const timeRatio = timeLeft / totalTimespan;
                  isAtRisk = timeRatio <= 0.1;
                  isCritical = timeRatio <= 0.2 && !isAtRisk;
                }
              }
              
              const isOverdue = dueDate && now > dueDate && task.status !== 'done';
              
              return (
                <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-orange-500' :
                    isOverdue ? 'bg-red-500' :
                    isAtRisk ? 'bg-yellow-500' :
                    isCritical ? 'bg-red-400' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      task.status === 'done' 
                        ? 'text-gray-500 dark:text-gray-400 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 text-xs ${
                        isOverdue ? 'text-red-500' :
                        isAtRisk ? 'text-yellow-500' :
                        isCritical ? 'text-red-400' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        {isOverdue && <span className="text-red-500 font-medium">Overdue!</span>}
                        {isAtRisk && <span className="text-yellow-500 font-medium">At Risk!</span>}
                        {isCritical && <span className="text-red-400 font-medium">Critical!</span>}
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