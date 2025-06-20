import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Award,
  BarChart3,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  Share2,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SocialShareModal from './SocialShareModal';

const Analytics: React.FC = () => {
  const { user, tasks } = useApp();
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [showShareModal, setShowShareModal] = useState(false);

  const analyticsData = useMemo(() => {
    const now = new Date();
    
    const getDateRange = (period: 'weekly' | 'monthly' | 'yearly') => {
      const end = new Date(now);
      const start = new Date(now);
      
      switch (period) {
        case 'weekly':
          start.setDate(start.getDate() - 7);
          break;
        case 'monthly':
          start.setDate(start.getDate() - 30);
          break;
        case 'yearly':
          start.setDate(start.getDate() - 365);
          break;
      }
      
      return { start, end };
    };

    const { start, end } = getDateRange(activeTab);
    
    const periodTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= start && taskDate <= end;
    });

    const completedTasks = periodTasks.filter(task => task.status === 'done');
    const totalFocusTime = Math.floor(Math.random() * 50) + 10; // Mock data for focus time in hours
    
    // Calculate productivity percentage
    const productivity = periodTasks.length > 0 
      ? Math.round((completedTasks.length / periodTasks.length) * 100) 
      : 0;
    
    // Calculate consistency score (mock data)
    const consistency = Math.min(100, Math.round((user?.streak || 0) * 3.33));
    
    // Calculate growth (mock data)
    const growth = Math.round(Math.random() * 30 + 5);
    
    return {
      tasksCompleted: completedTasks.length,
      totalTasks: periodTasks.length,
      focusTime: totalFocusTime,
      productivity,
      consistency,
      growth,
      topDay: 'Wednesday', // Mock data
      achievements: Math.floor(completedTasks.length / 10) // 1 achievement per 10 tasks
    };
  }, [tasks, activeTab, user]);

  const generateShareText = () => {
    const data = analyticsData;
    
    switch (activeTab) {
      case 'weekly':
        return `📊 Weekly Productivity Report!\n\n✅ Tasks Completed: ${data.tasksCompleted}\n⏰ Focus Time: ${data.focusTime}h\n📈 Productivity: ${data.productivity}%\n🎯 Consistency: ${data.consistency}%\n🏆 Top Day: ${data.topDay}\n\n#WeeklyWins #ProductivityHabits #TaskDefender`;
      
      case 'monthly':
        return `🚀 Monthly Productivity Milestone!\n\n✅ Tasks Completed: ${data.tasksCompleted}\n⏰ Total Focus Time: ${data.focusTime}h\n📈 Productivity: ${data.productivity}%\n📊 Growth: +${data.growth}%\n🏅 Achievements: ${data.achievements}\n\n#MonthlyGoals #ProductivityGrowth #TaskDefender`;
      
      case 'yearly':
        return `🏆 Yearly Productivity Achievement!\n\n✅ Tasks Completed: ${data.tasksCompleted}\n⏰ Total Focus Time: ${data.focusTime}h\n📈 Productivity: ${data.productivity}%\n🚀 Growth: +${data.growth}%\n🎖️ Achievements: ${data.achievements}\n\n#YearlyReview #ProductivityJourney #TaskDefender`;
      
      default:
        return '';
    }
  };

  const exportData = () => {
    const exportData = {
      user: user?.name,
      period: activeTab,
      data: analyticsData,
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

      {/* Time Range Selector */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'weekly', label: 'Weekly' },
          { id: 'monthly', label: 'Monthly' },
          { id: 'yearly', label: 'Yearly' }
        ].map(range => (
          <button
            key={range.id}
            onClick={() => setActiveTab(range.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === range.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.tasksCompleted}
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
                {analyticsData.focusTime}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Focus Time</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.productivity}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Productivity</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              {activeTab === 'weekly' ? 
                <Activity className="h-6 w-6 text-purple-500" /> :
                <Award className="h-6 w-6 text-purple-500" />
              }
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'weekly' ? 
                  `${analyticsData.consistency}%` :
                  analyticsData.achievements
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {activeTab === 'weekly' ? 'Consistency' : 'Achievements'}
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
                <span className="font-medium text-gray-900 dark:text-white">{analyticsData.productivity}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analyticsData.productivity}%` }}
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
                  <span className="font-medium text-gray-900 dark:text-white">{analyticsData.consistency}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.consistency}%` }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'monthly' && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Growth</span>
                  <span className="font-medium text-gray-900 dark:text-white">+{analyticsData.growth}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.growth}%` }}
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
            {analyticsData.productivity >= 80 && (
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

            {activeTab === 'monthly' && analyticsData.growth > 20 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">Growing Strong!</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {analyticsData.growth}% improvement this month. Your productivity is trending upward!
                  </p>
                </div>
              </div>
            )}

            {analyticsData.productivity < 50 && (
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

            {activeTab === 'weekly' && (
              <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-700 dark:text-purple-400">Peak Performance Day</p>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Your most productive day this week was {analyticsData.topDay}. Consider scheduling important tasks on this day.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Media Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareText={generateShareText()}
          period={activeTab}
        />
      )}
    </div>
  );
};

export default Analytics;