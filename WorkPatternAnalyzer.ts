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
    
    // Factor 3: Work pattern inconsistency
    if (task.workPattern) {
      if (task.workPattern.procrastinationScore > 70) risk += 20;
      if (task.workPattern.consistencyScore < 30) risk += 10;
    }
    
    // Factor 4: Last worked on
    if (task.workPattern?.lastWorkedOn) {
      const daysSinceWork = (Date.now() - task.workPattern.lastWorkedOn.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceWork > 2) risk += Math.min(20, daysSinceWork * 5);
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
    const { urgencyLevel, procrastinationRisk, timeRemaining, progressRate } = analysis;
    
    if (urgencyLevel === 'critical') {
      return "🚨 CRITICAL: Drop everything and focus on this task NOW!";
    }
    
    if (urgencyLevel === 'high' && procrastinationRisk > 60) {
      return "⚠️ HIGH RISK: This task needs immediate attention to avoid missing the deadline.";
    }
    
    if (procrastinationRisk > 80) {
      return "🎯 FOCUS MODE: Break this task into smaller chunks and start with just 15 minutes.";
    }
    
    if (progressRate < 20 && timeRemaining < 24 * 60) {
      return "⏰ TIME CRUNCH: Consider extending deadline or reducing scope.";
    }
    
    if (task.workPattern?.consistencyScore && task.workPattern.consistencyScore < 30) {
      return "📅 SCHEDULE IT: Block specific time slots to build consistency.";
    }
    
    return "✅ ON TRACK: Continue with your current approach.";
  }

  /**
   * Updates work pattern based on focus session data
   */
  public updateWorkPattern(task: Task, sessionDuration: number, wasProductive: boolean): WorkPattern {
    const currentPattern = task.workPattern || {
      totalTimeSpent: 0,
      sessionsCount: 0,
      averageSessionLength: 0,
      productiveHours: [],
      procrastinationScore: 0,
      consistencyScore: 100
    };

    const newTotalTime = currentPattern.totalTimeSpent + sessionDuration;
    const newSessionCount = currentPattern.sessionsCount + 1;
    const newAverageLength = newTotalTime / newSessionCount;
    
    // Track productive hours
    const currentHour = new Date().getHours();
    const productiveHours = [...currentPattern.productiveHours];
    if (wasProductive && !productiveHours.includes(currentHour)) {
      productiveHours.push(currentHour);
    }

    // Update procrastination score (lower is better)
    let procrastinationScore = currentPattern.procrastinationScore;
    if (wasProductive) {
      procrastinationScore = Math.max(0, procrastinationScore - 5);
    } else {
      procrastinationScore = Math.min(100, procrastinationScore + 10);
    }

    // Update consistency score based on regular work patterns
    const daysSinceLastWork = currentPattern.lastWorkedOn ? 
      (Date.now() - currentPattern.lastWorkedOn.getTime()) / (1000 * 60 * 60 * 24) : 0;
    
    let consistencyScore = currentPattern.consistencyScore;
    if (daysSinceLastWork <= 1) {
      consistencyScore = Math.min(100, consistencyScore + 5);
    } else if (daysSinceLastWork > 3) {
      consistencyScore = Math.max(0, consistencyScore - 10);
    }

    return {
      totalTimeSpent: newTotalTime,
      sessionsCount: newSessionCount,
      averageSessionLength: newAverageLength,
      productiveHours,
      procrastinationScore,
      consistencyScore,
      lastWorkedOn: new Date()
    };
  }

  /**
   * Generates smart scheduling suggestions
   */
  public generateSchedulingSuggestions(task: Task, userProductiveHours: number[] = []): TimeBlock[] {
    const suggestions: TimeBlock[] = [];
    const estimatedTime = task.estimatedTime || 60;
    const now = new Date();
    
    // Determine optimal session length based on task complexity and user patterns
    const optimalSessionLength = this.getOptimalSessionLength(task, userProductiveHours);
    const numberOfSessions = Math.ceil(estimatedTime / optimalSessionLength);
    
    // Generate time blocks for the next week
    for (let day = 0; day < 7; day++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + day);
      
      // Skip weekends for work tasks (unless user prefers weekend work)
      if (targetDate.getDay() === 0 || targetDate.getDay() === 6) continue;
      
      // Suggest time blocks during user's productive hours
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

  private getOptimalSessionLength(task: Task, userProductiveHours: number[]): number {
    // Base session length on task priority and estimated time
    let baseLength = 45; // Default 45 minutes
    
    switch (task.priority) {
      case 'urgent':
        baseLength = 90; // Longer sessions for urgent tasks
        break;
      case 'high':
        baseLength = 60;
        break;
      case 'medium':
        baseLength = 45;
        break;
      case 'low':
        baseLength = 30;
        break;
    }
    
    // Adjust based on estimated time
    const estimatedTime = task.estimatedTime || 60;
    if (estimatedTime < 30) baseLength = Math.min(baseLength, 25);
    if (estimatedTime > 180) baseLength = Math.max(baseLength, 60);
    
    // Consider user's historical session patterns
    if (task.workPattern?.averageSessionLength) {
      const historicalLength = task.workPattern.averageSessionLength;
      baseLength = Math.round((baseLength + historicalLength) / 2);
    }
    
    return Math.max(15, Math.min(120, baseLength)); // Between 15 and 120 minutes
  }
}

export const workPatternAnalyzer = new WorkPatternAnalyzer();