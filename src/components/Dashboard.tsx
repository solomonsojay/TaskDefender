import React, { useState } from 'react';
import { Target, Clock, CheckCircle2, Plus, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { user, tasks, addTask, startFocusSession } = useApp();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const completedTasks = tasks.filter(task => task.status === 'done');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const todoTasks = tasks.filter(task => task.status === 'todo');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      description: '',
      priority: 'medium',
      status: 'todo',
      tags: [],
    });

    setNewTaskTitle('');
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
          Ready to defend your productivity today?
        </p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="font-medium">🔥 {user?.streak} day streak</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">✅ {user?.integrityScore}% integrity</span>
          </div>
        </div>
      </div>

      {/* Quick Task Capture */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Task Capture
        </h2>
        <form onSubmit={handleAddTask} className="flex space-x-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
          />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            recentTasks.map(task => (
              <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'in-progress' ? 'bg-orange-500' :
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;