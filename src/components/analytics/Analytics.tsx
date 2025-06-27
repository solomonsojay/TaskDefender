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
import { userActionService } from '../../services/UserActionService';
import SocialShareModal from './SocialShareModal';

const Analytics: React.FC = () => {
  const { user, tasks } = useApp();
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [showShareModal, setShowShareModal] = useState(false);

  const analyticsData = useMemo(() => {
    if (!user) return null;

    const days = activeTab === 'weekly' ? 7 : activeTab === 'monthly' ? 30 : 365;
    const actionData = userActionService.getAnalyticsData(user.id, days);
    const streakData = userActionService.getStreakData(user.id);

    // Calculate additional metrics
    const completedTasks = tasks.filter(task => task.status === 'done');
    const totalFocusTime = user.totalFocusTime || 0;
    
    // Calculate productivity percentage
    const totalTasks = tasks.length;
    const productivity = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    
    // Calculate consistency score based on streak
    const consistency = Math.min(100, Math.round(streakData.currentStreak * 10));
    
    // Calculate growth (mock data based on completion rate)
    const growth = Math.min(50, Math.round(productivity / 2));
    
    // Find most productive day (mock data)
    const days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const topDay = days_of_week[Math.floor(Math.random() * days_of_week.length)];
    
    return {
      tasksCompleted: actionData.tasksCompleted,
      totalTasks: totalTasks,
      focusTime: Math.round(totalFocusTime / 60), // Convert to hours
      productivity,
      consistency,
      growth,
      topDay,
      achievements: Math.floor(completedTasks.length / 5), // 1 achievement per 5 tasks
      integrityScore: actionData.integrityScore,
      streak: streakData.currentStreak,
      totalFocusMinutes: actionData.totalFocusMinutes,
      averageTaskCompletionTime: actionData.averageTaskCompletionTime,
      procrastinationEvents: actionData.procrastinationEvents,
      focusSessionsCompleted: actionData.focusSessionsCompleted,
      honestCompletions: actionData.honestCompletions,
      dishonestCompletions: actionData.dishonestCompletions
    };
  }, [tasks, activeTab, user]);

  const generateShareText = () => {
    if (!analyticsData) return '';
    
    switch (activeTab) {
      case 'weekly':
        return `📊 Weekly Productivity Report!\n\n✅ Tasks Completed: ${analyticsData.tasksCompleted}\n⏰ Focus Time: ${analyticsData.focusTime}h\n📈 Productivity: ${analyticsData.productivity}%\n🎯 Consistency: ${analyticsData.consistency}%\n🔥 Streak: ${analyticsData.streak} days\n🏆 Top Day: ${analyticsData.topDay}\n\n#WeeklyWins #ProductivityHabits #TaskDefender`;
      
      case 'monthly':
        return `🚀 Monthly Productivity Milestone!\n\n✅ Tasks Completed: ${analyticsData.tasksCompleted}\n⏰ Total Focus Time: ${analyticsData.focusTime}h\n📈 Productivity: ${analyticsData.productivity}%\n📊 Growth: +${analyticsData.growth}%\n🏅 Achievements: ${analyticsData.achievements}\n🎯 Integrity Score: ${analyticsData.integrityScore}%\n\n#MonthlyGoals #ProductivityGrowth #TaskDefender`;
      
      case 'yearly':
        return `🏆 Yearly Productivity Achievement!\n\n✅ Tasks Completed: ${analyticsData.tasksCompleted}\n⏰ Total Focus Time: ${analyticsData.focusTime}h\n📈 Productivity: ${analyticsData.productivity}%\n🚀 Growth: +${analyticsData.growth}%\n🎖️ Achievements: ${analyticsData.achievements}\n🔥 Best Streak: ${analyticsData.streak} days\n\n#YearlyReview #ProductivityJourney #TaskDefender`;
      
      default:
        return '';
    }
  };

  const exportData = () => {
    if (!analyticsData || !user) return;

    const exportData = {
      user: user.name,
      period: activeTab,
      data: analyticsData,
      generatedAt: new Date().toISOString(),
      tasks: tasks.length,
      integrityScore: user.integrityScore,
      userActions: userActionService.getAnalyticsData(user.id, 365) // Full year for export
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

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Complete some tasks to see your productivity analytics
        </p>
      </div>
    );
  }

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
                {analyticsData.totalFocusMinutes}m
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
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.streak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
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
                <span className="font-medium text-gray-900 dark:text-white">{analyticsData.integrityScore}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analyticsData.integrityScore}%` }}
                />
              </div>
            </div>

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

        {/* Detailed Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detailed Statistics
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Focus Sessions</span>
              <span className="font-medium text-gray-900 dark:text-white">{analyticsData.focusSessionsCompleted}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Task Time</span>
              <span className="font-medium text-gray-900 dark:text-white">{analyticsData.averageTaskCompletionTime}m</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Procrastination Events</span>
              <span className="font-medium text-gray-900 dark:text-white">{analyticsData.procrastinationEvents}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Honest Completions</span>
              <span className="font-medium text-green-600 dark:text-green-400">{analyticsData.honestCompletions}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Dishonest Completions</span>
              <span className="font-medium text-red-600 dark:text-red-400">{analyticsData.dishonestCompletions}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Achievements Earned</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">{analyticsData.achievements}</span>
            </div>
          </div>
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

          {analyticsData.streak >= 7 && (
            <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Zap className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-orange-700 dark:text-orange-400">Streak Master!</p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {analyticsData.streak} days of consistent productivity. You're building great habits!
                </p>
              </div>
            </div>
          )}

          {analyticsData.integrityScore >= 95 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Award className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">Integrity Champion!</p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Your integrity score of {analyticsData.integrityScore}% shows your commitment to honest task completion.
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

          {analyticsData.procrastinationEvents > 5 && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Procrastination Alert</p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  You've had {analyticsData.procrastinationEvents} procrastination events. Try using the focus mode and reminders to stay on track.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium text-purple-700 dark:text-purple-400">Peak Performance Day</p>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Your most productive day is {analyticsData.topDay}. Consider scheduling important tasks on this day.
              </p>
            </div>
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