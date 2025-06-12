import { Task, WorkPattern, TimeBlock } from '../types';

export interface TaskAnalysis {
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  timeUtilization: number; // percentage of allocated time used
  procrastinationRisk: number; // 0-100
  recommendedAction: string;
  timeRemaining: number; // minutes until deadline
  progressRate: number; // percentage completed vs time elapsed
}

export class WorkPatternAnalyzer {
  
  /**
   * Analyzes a task's work pattern and current status
   */
  public analyzeTask(task: Task): TaskAnalysis {
    const now = new Date();
    const timeRemaining = task.dueDate ? 
      Math.max(0, task.dueDate.getTime() - now.getTime()) / (1000 * 60) : 
      Infinity;
    
    const totalAllocatedTime = task.timeBlocks?.reduce((sum, block) => sum + block.duration, 0) || 0;
    const timeSpent = task.workPattern?.totalTimeSpent || 0;
    const timeUtilization = totalAllocatedTime > 0 ? (timeSpent / totalAllocatedTime) * 100 : 0;
    
    // Calculate urgency based on deadline proximity and completion status
    const urgencyLevel = this.calculateUrgencyLevel(task, timeRemaining);
    
    // Calculate procrastination risk
    const procrastinationRisk = this.calculateProcrastinationRisk(task, timeRemaining);
    
    // Calculate progress rate
    const progressRate = this.calculateProgressRate(task);
    
    // Generate recommended action
    const recommendedAction = this.generateRecommendation(task, {
      urgencyLevel,
      timeUtilization,
      procrastinationRisk,
      timeRemaining,
      progressRate
    });

    return {
      urgencyLevel,
      timeUtilization,
      procrastinationRisk,
      recommendedAction,
      timeRemaining,
      progressRate
    };
  }

  private calculateUrgencyLevel(task: Task, timeRemaining: number): 'low' | 'medium' | 'high' | 'critical' {
    if (!task.dueDate) return 'low';
    
    const hoursRemaining = timeRemaining / 60;
    const estimatedHours = (task.estimatedTime || 60) / 60;
    
    if (hoursRemaining < estimatedHours * 0.5) return 'critical';
    if (hoursRemaining < estimatedHours * 1.2) return 'high';
    if (hoursRemaining < estimatedHours * 2) return 'medium';
    return 'low';
  }

  private calculateProcrastinationRisk(task: Task, timeRemaining: number): number {
    let risk = 0;
    
    // Factor 1: Time since creation vs progress
    const daysSinceCreation = (Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 3 && task.status === 'todo') risk += 30;
    
    // Factor 2: Deadline proximity
    if (task.dueDate) {
      const hoursRemaining = timeRemaining / 60;
      const estimatedHours = (task.estimatedTime || 60) / 60;
      
      if (hoursRemaining < estimatedHours) risk += 40;
      else if (hoursRemaining < estimatedHours * 2) risk += 20;
    }
    
    return Math.min(100, risk);
  }

  private calculateProgressRate(task: Task): number {
    if (task.status === 'done') return 100;
    if (task.status === 'todo') return 0;
    
    // For in-progress tasks, estimate based on time spent vs estimated time
    const timeSpent = task.workPattern?.totalTimeSpent || 0;
    const estimatedTime = task.estimatedTime || 60;
    
    // Cap at 90% for in-progress tasks (never 100% until marked done)
    return Math.min(90, (timeSpent / estimatedTime) * 100);
  }

  private generateRecommendation(task: Task, analysis: TaskAnalysis): string {
    const { urgencyLevel, procrastinationRisk } = analysis;
    
    if (urgencyLevel === 'critical') {
      return "🚨 CRITICAL: Drop everything and focus on this task NOW!";
    }
    
    if (urgencyLevel === 'high' && procrastinationRisk > 60) {
      return "⚠️ HIGH RISK: This task needs immediate attention to avoid missing the deadline.";
    }
    
    if (procrastinationRisk > 80) {
      return "🎯 FOCUS MODE: Break this task into smaller chunks and start with just 15 minutes.";
    }
    
    return "✅ ON TRACK: Continue with your current approach.";
  }

  /**
   * Generates smart scheduling suggestions
   */
  public generateSchedulingSuggestions(task: Task, userProductiveHours: number[] = []): TimeBlock[] {
    const suggestions: TimeBlock[] = [];
    const estimatedTime = task.estimatedTime || 60;
    const now = new Date();
    
    // Determine optimal session length
    const optimalSessionLength = 45; // Default 45 minutes
    const numberOfSessions = Math.ceil(estimatedTime / optimalSessionLength);
    
    // Generate time blocks for the next week
    for (let day = 0; day < 7; day++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + day);
      
      // Skip weekends for work tasks
      if (targetDate.getDay() === 0 || targetDate.getDay() === 6) continue;
      
      // Suggest time blocks during productive hours
      const productiveHoursToday = userProductiveHours.length > 0 ? 
        userProductiveHours : [9, 10, 14, 15]; // Default productive hours
      
      for (const hour of productiveHoursToday) {
        if (suggestions.length >= numberOfSessions) break;
        
        const startTime = new Date(targetDate);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + optimalSessionLength);
        
        suggestions.push({
          id: `suggestion_${Date.now()}_${suggestions.length}`,
          startTime,
          endTime,
          duration: optimalSessionLength,
          isScheduled: false,
          isCompleted: false,
          notes: `Suggested ${optimalSessionLength}min session`
        });
      }
    }
    
    return suggestions.slice(0, numberOfSessions);
  }
}

export const workPatternAnalyzer = new WorkPatternAnalyzer();