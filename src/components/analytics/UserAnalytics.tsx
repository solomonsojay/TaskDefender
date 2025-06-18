import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Award,
  Share2,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import SocialMediaIntegration from './SocialMediaIntegration';

interface AnalyticsData {
  daily: {
    tasksCompleted: number;
    focusTime: number;
    productivity: number;
    streak: number;
  };
  weekly: {
    tasksCompleted: number;
    avgDailyFocus: number;
    productivity: number;
    consistency: number;
    topDay: string;
  };
  monthly: {
    tasksCompleted: number;
    totalFocusTime: number;
    productivity: number;
    growth: number;
    achievements: number;
  };
}

const UserAnalytics: React.FC = () => {
  const { user, tasks } = useApp();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [showShareModal, setShowShareModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    daily: { tasksCompleted: 0, focusTime: 0, productivity: 0, streak: 0 },
    weekly: { tasksCompleted: 0, avgDailyFocus: 0, productivity: 0, consistency: 0, topDay: 'Monday' },
    monthly: { tasksCompleted: 0, totalFocusTime: 0, productivity: 0, growth: 0, achievements: 0 }
  });

  useEffect(() => {
    calculateAnalytics();
  }, [tasks, user]);

  const calculateAnalytics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Daily Analytics
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= today;
    });
    const dailyCompleted = todayTasks.filter(task => task.status === 'done').length;
    const dailyFocusTime = todayTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);

    // Weekly Analytics
    const weekTasks = tasks.filter(task => task.createdAt >= weekAgo);
    const weeklyCompleted = weekTasks.filter(task => task.status === 'done').length;
    const weeklyFocusTime = weekTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);

    // Monthly Analytics
    const monthTasks = tasks.filter(task => task.createdAt >= monthAgo);
    const monthlyCompleted = monthTasks.filter(task => task.status === 'done').length;
    const monthlyFocusTime = monthTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);

    setAnalyticsData({
      daily: {
        tasksCompleted: dailyCompleted,
        focusTime: Math.round(dailyFocusTime / 60), // Convert to hours
        productivity: dailyCompleted > 0 ? Math.round((dailyCompleted / todayTasks.length) * 100) : 0,
        streak: user?.streak || 0
      },
      weekly: {
        tasksCompleted: weeklyCompleted,
        avgDailyFocus: Math.round(weeklyFocusTime / 7 / 60), // Average daily hours
        productivity: weeklyCompleted > 0 ? Math.round((weeklyCompleted / weekTasks.length) * 100) : 0,
        consistency: Math.min(100, Math.round((weeklyCompleted / 7) * 20)), // Rough consistency score
        topDay: 'Wednesday' // Mock data
      },
      monthly: {
        tasksCompleted: monthlyCompleted,
        totalFocusTime: Math.round(monthlyFocusTime / 60), // Total hours
        productivity: monthlyCompleted > 0 ? Math.round((monthlyCompleted / monthTasks.length) * 100) : 0,
        growth: Math.round(Math.random() * 30 + 10), // Mock growth percentage
        achievements: Math.floor(monthlyCompleted / 10) // 1 achievement per 10 tasks
      }
    });
  };

  const generateShareText = () => {
    const data = analyticsData[activeTab];
    const period = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    
    switch (activeTab) {
      case 'daily':
        return `🎯 Today's Productivity Update!\n\n✅ Tasks Completed: ${data.tasksCompleted}\n⏰ Focus Time: ${data.focusTime}h\n📈 Productivity: ${data.productivity}%\n🔥 Streak: ${data.streak} days\n\n#ProductivityJourney #TaskDefender #GetThingsDone`;
      
      case 'weekly':
        return `📊 Weekly Productivity Report!\n\n✅ Tasks Completed: ${data.tasksCompleted}\n⏰ Avg Daily Focus: ${data.avgDailyFocus}h\n📈 Productivity: ${data.productivity}%\n🎯 Consistency: ${data.consistency}%\n🏆 Top Day: ${data.topDay}\n\n#WeeklyWins #ProductivityHabits #TaskDefender`;
      
      case 'monthly':
        return `🚀 Monthly Productivity Milestone!\n\n✅ Tasks Completed: ${data.tasksCompleted}\n⏰ Total Focus Time: ${data.totalFocusTime}h\n📈 Productivity: ${data.productivity}%\n📊 Growth: +${data.growth}%\n🏅 Achievements: ${data.achievements}\n\n#MonthlyGoals #ProductivityGrowth #TaskDefender`;
      
      default:
        return '';
    }
  };

  const exportData = () => {
    const exportData = {
      user: user?.name,
      period: activeTab,
      data: analyticsData[activeTab],
      generatedAt: new Date().toISOString(),
      tasks: tasks.length,
      integrityScore: user?.integrityScore
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskdefender-analytics-${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'Weekly', icon: BarChart3 },
    { id: 'monthly', label: 'Monthly', icon: TrendingUp },
  ];

  const currentData = analyticsData[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Productivity Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and celebrate your achievements
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentData.tasksCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'daily' ? currentData.focusTime : 
                 activeTab === 'weekly' ? currentData.avgDailyFocus : 
                 currentData.totalFocusTime}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {activeTab === 'weekly' ? 'Avg Daily Focus' : 'Focus Time'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <Target className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentData.productivity}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Productivity</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              {activeTab === 'daily' ? <Zap className="h-6 w-6 text-purple-500" /> :
               activeTab === 'weekly' ? <Activity className="h-6 w-6 text-purple-500" /> :
               <Award className="h-6 w-6 text-purple-500" />}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'daily' ? currentData.streak :
                 activeTab === 'weekly' ? `${currentData.consistency}%` :
                 currentData.achievements}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {activeTab === 'daily' ? 'Day Streak' :
                 activeTab === 'weekly' ? 'Consistency' :
                 'Achievements'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Progress Overview
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Task Completion</span>
                <span className="font-medium text-gray-900 dark:text-white">{currentData.productivity}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentData.productivity}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Integrity Score</span>
                <span className="font-medium text-gray-900 dark:text-white">{user?.integrityScore}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${user?.integrityScore}%` }}
                />
              </div>
            </div>

            {activeTab === 'weekly' && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Consistency</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currentData.consistency}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentData.consistency}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Key Insights
          </h3>
          
          <div className="space-y-4">
            {currentData.productivity >= 80 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">Excellent Performance!</p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    You're maintaining high productivity levels. Keep up the great work!
                  </p>
                </div>
              </div>
            )}

            {user?.streak && user.streak >= 7 && (
              <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Zap className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-700 dark:text-orange-400">Streak Master!</p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    {user.streak} days of consistent productivity. You're building great habits!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'monthly' && currentData.growth > 20 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">Growing Strong!</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {currentData.growth}% improvement this month. Your productivity is trending upward!
                  </p>
                </div>
              </div>
            )}

            {currentData.productivity < 50 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">Room for Improvement</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    Consider breaking tasks into smaller chunks and using focus mode more often.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Media Share Modal */}
      {showShareModal && (
        <SocialMediaIntegration
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareText={generateShareText()}
          analyticsData={currentData}
          period={activeTab}
        />
      )}
    </div>
  );
};

export default UserAnalytics;