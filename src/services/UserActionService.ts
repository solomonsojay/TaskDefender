import { UserAction } from '../types';
import { generateSecureId } from '../utils/validation';

export class UserActionService {
  private static instance: UserActionService;

  private constructor() {}

  static getInstance(): UserActionService {
    if (!UserActionService.instance) {
      UserActionService.instance = new UserActionService();
    }
    return UserActionService.instance;
  }

  logAction(
    userId: string,
    action: UserAction['action'],
    taskId?: string,
    metadata?: any,
    integrityImpact?: number
  ) {
    try {
      const userAction: UserAction = {
        id: generateSecureId(),
        userId,
        action,
        timestamp: new Date(),
        taskId,
        metadata,
        integrityImpact
      };

      const actions = this.getUserActions(userId);
      actions.push(userAction);

      // Keep only last 1000 actions per user
      if (actions.length > 1000) {
        actions.splice(0, actions.length - 1000);
      }

      localStorage.setItem(`taskdefender_actions_${userId}`, JSON.stringify(actions));

      // Update user integrity score if there's an impact
      if (integrityImpact !== undefined) {
        this.updateUserIntegrityScore(userId, integrityImpact);
      }

      console.log('📊 User action logged:', action, { taskId, integrityImpact });
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }

  private getUserActions(userId: string): UserAction[] {
    try {
      const saved = localStorage.getItem(`taskdefender_actions_${userId}`);
      if (!saved) return [];

      return JSON.parse(saved).map((action: any) => ({
        ...action,
        timestamp: new Date(action.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load user actions:', error);
      return [];
    }
  }

  private updateUserIntegrityScore(userId: string, impact: number) {
    try {
      const userData = localStorage.getItem('taskdefender_current_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      if (user.id !== userId) return;

      const currentScore = user.integrityScore || 100;
      const newScore = Math.max(0, Math.min(100, currentScore + impact));

      user.integrityScore = newScore;
      user.updatedAt = new Date();

      localStorage.setItem('taskdefender_current_user', JSON.stringify(user));

      console.log('🎯 Integrity score updated:', currentScore, '→', newScore);
    } catch (error) {
      console.error('Failed to update integrity score:', error);
    }
  }

  getAnalyticsData(userId: string, days: number = 30): any {
    try {
      const actions = this.getUserActions(userId);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const recentActions = actions.filter(action => action.timestamp >= cutoffDate);

      const taskCompletions = recentActions.filter(a => a.action === 'task_completed');
      const focusSessions = recentActions.filter(a => a.action === 'focus_completed');
      const procrastinationEvents = recentActions.filter(a => a.action === 'procrastination_detected');
      const honestCompletions = recentActions.filter(a => a.action === 'honest_completion');
      const dishonestCompletions = recentActions.filter(a => a.action === 'dishonest_completion');

      const totalFocusTime = focusSessions.reduce((sum, session) => {
        return sum + (session.metadata?.duration || 0);
      }, 0);

      const averageTaskTime = taskCompletions.length > 0 ? 
        taskCompletions.reduce((sum, task) => sum + (task.metadata?.completionTime || 0), 0) / taskCompletions.length : 0;

      const integrityScore = honestCompletions.length + dishonestCompletions.length > 0 ?
        (honestCompletions.length / (honestCompletions.length + dishonestCompletions.length)) * 100 : 100;

      return {
        totalActions: recentActions.length,
        tasksCompleted: taskCompletions.length,
        focusSessionsCompleted: focusSessions.length,
        totalFocusMinutes: Math.round(totalFocusTime / 60),
        procrastinationEvents: procrastinationEvents.length,
        averageTaskCompletionTime: Math.round(averageTaskTime),
        integrityScore: Math.round(integrityScore),
        honestCompletions: honestCompletions.length,
        dishonestCompletions: dishonestCompletions.length
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return {
        totalActions: 0,
        tasksCompleted: 0,
        focusSessionsCompleted: 0,
        totalFocusMinutes: 0,
        procrastinationEvents: 0,
        averageTaskCompletionTime: 0,
        integrityScore: 100,
        honestCompletions: 0,
        dishonestCompletions: 0
      };
    }
  }

  getStreakData(userId: string): { currentStreak: number; longestStreak: number } {
    try {
      const actions = this.getUserActions(userId);
      const taskCompletions = actions
        .filter(a => a.action === 'task_completed')
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      if (taskCompletions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
      }

      // Group completions by date
      const completionsByDate = new Map<string, number>();
      taskCompletions.forEach(completion => {
        const dateKey = completion.timestamp.toDateString();
        completionsByDate.set(dateKey, (completionsByDate.get(dateKey) || 0) + 1);
      });

      const dates = Array.from(completionsByDate.keys()).sort();
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Calculate streaks
      for (let i = 0; i < dates.length; i++) {
        const currentDate = new Date(dates[i]);
        const prevDate = i > 0 ? new Date(dates[i - 1]) : null;

        if (!prevDate || this.isConsecutiveDay(prevDate, currentDate)) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);

      // Calculate current streak (from today backwards)
      const today = new Date().toDateString();
      const todayIndex = dates.indexOf(today);
      
      if (todayIndex >= 0) {
        currentStreak = 1;
        for (let i = todayIndex - 1; i >= 0; i--) {
          const currentDate = new Date(dates[i]);
          const nextDate = new Date(dates[i + 1]);
          
          if (this.isConsecutiveDay(currentDate, nextDate)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      return { currentStreak, longestStreak };
    } catch (error) {
      console.error('Failed to calculate streak data:', error);
      return { currentStreak: 0, longestStreak: 0 };
    }
  }

  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }
}

export const userActionService = UserActionService.getInstance();