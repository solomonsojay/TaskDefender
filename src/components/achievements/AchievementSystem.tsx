import React from 'react';
import { 
  Award, 
  Crown, 
  Target, 
  Zap, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Shield,
  Star,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

const AchievementSystem: React.FC = () => {
  const { user, tasks } = useApp();

  const calculateBadges = (): Badge[] => {
    const completedTasks = tasks.filter(t => t.status === 'done');
    const todayTasks = tasks.filter(t => {
      const today = new Date();
      const taskDate = new Date(t.createdAt);
      return taskDate.toDateString() === today.toDateString();
    });
    const completedToday = todayTasks.filter(t => t.status === 'done');

    return [
      {
        id: 'captain_excuse',
        title: 'Captain Excuse',
        description: 'Master of creative procrastination (ironic achievement)',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        earned: tasks.filter(t => t.honestlyCompleted === false).length >= 3,
        progress: tasks.filter(t => t.honestlyCompleted === false).length,
        maxProgress: 3
      },
      {
        id: 'i_did_a_thing',
        title: 'I Did a Thing Today',
        description: 'Completed at least one task today',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        earned: completedToday.length > 0,
        progress: completedToday.length,
        maxProgress: 1
      },
      {
        id: 'streak_warrior',
        title: 'Streak Warrior',
        description: 'Maintained a 7-day productivity streak',
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        earned: (user?.streak || 0) >= 7,
        progress: user?.streak || 0,
        maxProgress: 7
      },
      {
        id: 'last_minute_larry',
        title: 'Last Minute Larry',
        description: 'Completed 5 tasks within 1 hour of deadline',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        earned: completedTasks.filter(t => {
          if (!t.dueDate || !t.completedAt) return false;
          const timeDiff = t.dueDate.getTime() - t.completedAt.getTime();
          return timeDiff < 60 * 60 * 1000; // Less than 1 hour
        }).length >= 5,
        progress: completedTasks.filter(t => {
          if (!t.dueDate || !t.completedAt) return false;
          const timeDiff = t.dueDate.getTime() - t.completedAt.getTime();
          return timeDiff < 60 * 60 * 1000;
        }).length,
        maxProgress: 5
      },
      {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Maintained 95%+ integrity score',
        icon: Star,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        earned: (user?.integrityScore || 0) >= 95,
        progress: user?.integrityScore || 0,
        maxProgress: 95
      },
      {
        id: 'task_terminator',
        title: 'Task Terminator',
        description: 'Completed 50 tasks total',
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        earned: completedTasks.length >= 50,
        progress: completedTasks.length,
        maxProgress: 50
      },
      {
        id: 'productivity_king',
        title: 'Productivity Royalty',
        description: 'Completed 10 tasks in a single day',
        icon: Crown,
        color: 'text-gold-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        earned: false, // Would need daily tracking
        progress: completedToday.length,
        maxProgress: 10
      },
      {
        id: 'consistency_champion',
        title: 'Consistency Champion',
        description: 'Worked on tasks for 30 consecutive days',
        icon: TrendingUp,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
        earned: (user?.streak || 0) >= 30,
        progress: user?.streak || 0,
        maxProgress: 30
      },
      {
        id: 'legend',
        title: 'TaskDefender Legend',
        description: 'Achieved all other badges - Your Last Line of Defense!',
        icon: Trophy,
        color: 'text-gradient',
        bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20',
        earned: false, // Calculate based on other badges
        progress: 0,
        maxProgress: 8
      }
    ];
  };

  const badges = calculateBadges();
  const earnedBadges = badges.filter(b => b.earned);
  const availableBadges = badges.filter(b => !b.earned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-yellow-500/20 p-3 rounded-xl">
          <Trophy className="h-6 w-6 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Achievement System
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Earn badges as you defend against procrastination
          </p>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Your Achievements ({earnedBadges.length})</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map(badge => (
              <div key={badge.id} className={`${badge.bgColor} border border-gray-200 dark:border-gray-600 rounded-xl p-4 transition-all duration-200 hover:shadow-md`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <badge.icon className={`h-6 w-6 ${badge.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{badge.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    ✅ EARNED
                  </span>
                  {badge.earnedAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {badge.earnedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Badges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Award className="h-5 w-5 text-gray-500" />
          <span>Available Achievements ({availableBadges.length})</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableBadges.map(badge => (
            <div key={badge.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-200 hover:shadow-md opacity-75">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <badge.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">{badge.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{badge.description}</p>
                </div>
              </div>
              
              {badge.progress !== undefined && badge.maxProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {badge.progress}/{badge.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (badge.progress / badge.maxProgress) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">
          🎯 Achievement Tips
        </h4>
        <div className="space-y-2 text-blue-600 dark:text-blue-300 text-sm">
          <p>• Complete tasks honestly to maintain your integrity score</p>
          <p>• Build daily habits to maintain your productivity streak</p>
          <p>• Use focus mode regularly to improve your work quality</p>
          <p>• Set realistic deadlines to avoid last-minute rushes</p>
          <p>• Remember: TaskDefender is your last line of defense against procrastination!</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;