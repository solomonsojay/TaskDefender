import React from 'react';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Zap,
  Users,
  Award,
  Trophy
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSarcasticPrompts } from '../../hooks/useSarcasticPrompts';
import BadgeSystem from '../gamification/BadgeSystem';

const Dashboard: React.FC = () => {
  const { user, tasks, focusSession } = useApp();
  const { getCriticalTasks, getProcrastinatingTasks } = useSarcasticPrompts();

  const todayTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.createdAt);
    return taskDate.toDateString() === today.toDateString();
  });

  const completedTasks = tasks.filter(task => task.status === 'done');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');

  const criticalTasks = getCriticalTasks();
  const procrastinatingTasks = getProcrastinatingTasks();

  const stats = [
    {
      title: 'Tasks Completed',
      value: completedTasks.length,
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-400',
    },
    {
      title: 'In Progress',
      value: inProgressTasks.length,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-400',
    },
    {
      title: 'Critical Tasks',
      value: criticalTasks.length,
      icon: Zap,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-400',
    },
    {
      title: 'Focus Sessions',
      value: focusSession ? 1 : 0,
      icon: Target,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
  ];

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-green-500 rounded-2xl text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-orange-100 mb-4">
              Ready to defend your productivity today?
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="font-medium">{user?.streak} day streak</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-300" />
                <span className="font-medium">{user?.integrityScore}% integrity</span>
              </div>
              {criticalTasks.length > 0 && (
                <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full">
                  <Zap className="h-4 w-4 text-red-200 animate-pulse" />
                  <span className="font-medium text-red-200">{criticalTasks.length} critical</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold mb-1">{todayTasks.length}</div>
              <div className="text-sm text-orange-100">Tasks Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-6 transition-all duration-200 hover:shadow-md`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </div>
            </div>
            <h3 className={`font-medium ${stat.textColor}`}>
              {stat.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Tasks
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No tasks yet. Add one to get started!
                </p>
              </div>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-orange-500' :
                    task.status === 'blocked' ? 'bg-red-500' :
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString()}
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
                </div>
              ))
            )}
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Productivity Insights
            </h2>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Great Progress!
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300">
                You've completed {completedTasks.length} tasks with {user?.integrityScore}% honesty rate.
              </p>
            </div>

            {criticalTasks.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap className="h-5 w-5 text-red-500 animate-pulse" />
                  <span className="font-semibold text-red-700 dark:text-red-400">
                    Critical Alert!
                  </span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">
                  You have {criticalTasks.length} critical task{criticalTasks.length !== 1 ? 's' : ''} requiring immediate attention!
                </p>
              </div>
            )}

            {procrastinatingTasks.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                    Procrastination Risk
                  </span>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  {procrastinatingTasks.length} task{procrastinatingTasks.length !== 1 ? 's' : ''} at high risk. Consider breaking them into smaller chunks.
                </p>
              </div>
            )}

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-orange-700 dark:text-orange-400">
                  Streak Power
                </span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-300">
                Keep your {user?.streak} day streak alive! Complete at least one task today.
              </p>
            </div>

            {user?.role === 'admin' && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    Team Leadership
                  </span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  As a team admin, your productivity sets an example for your team members.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badge System */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-yellow-500/20 p-3 rounded-xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Achievement System
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Earn badges for your productivity milestones
            </p>
          </div>
        </div>
        
        <BadgeSystem />
      </div>
    </div>
  );
};

export default Dashboard;