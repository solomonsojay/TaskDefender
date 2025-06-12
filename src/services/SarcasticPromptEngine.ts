import { Task } from '../types';
import { workPatternAnalyzer, TaskAnalysis } from './WorkPatternAnalyzer';

export interface PromptContext {
  taskCount: number;
  completedToday: number;
  overdueTasks: number;
  lastActivity: Date | null;
  currentStreak: number;
  integrityScore: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  criticalTasks: Task[];
  procrastinatingTasks: Task[];
  taskAnalyses: Map<string, TaskAnalysis>;
}

export interface SarcasticPrompt {
  id: string;
  message: string;
  type: 'nudge' | 'roast' | 'motivation' | 'completion' | 'deadline-warning' | 'pattern-analysis';
  severity: 'gentle' | 'medium' | 'savage';
  persona: 'default' | 'gordon' | 'mom' | 'hr' | 'passive-aggressive';
  triggers: {
    minIdleTime?: number; // minutes
    taskStates?: string[];
    conditions?: string[];
    taskId?: string; // For task-specific prompts
  };
  taskContext?: {
    taskId: string;
    urgency: string;
    timeRemaining: number;
    procrastinationRisk: number;
  };
}

export class SarcasticPromptEngine {
  private prompts: SarcasticPrompt[] = [
    // EXISTING PROMPTS (keeping all previous ones)
    {
      id: 'idle_gentle_1',
      message: "Those tasks aren't going to complete themselves... unless you've invented self-doing work. Have you?",
      type: 'nudge',
      severity: 'gentle',
      persona: 'default',
      triggers: { minIdleTime: 30, conditions: ['has_pending_tasks'] }
    },
    {
      id: 'idle_medium_1',
      message: "I see you're practicing the ancient art of 'productive procrastination.' How's that working out for you?",
      type: 'nudge',
      severity: 'medium',
      persona: 'default',
      triggers: { minIdleTime: 60, conditions: ['has_pending_tasks'] }
    },
    {
      id: 'idle_savage_1',
      message: "At this rate, your tasks will be completed sometime around the heat death of the universe. But hey, no pressure.",
      type: 'nudge',
      severity: 'savage',
      persona: 'default',
      triggers: { minIdleTime: 120, conditions: ['has_pending_tasks'] }
    },
    
    // NEW TIMELINE-AWARE PROMPTS
    {
      id: 'deadline_critical_1',
      message: "🚨 ALERT: Your deadline is breathing down your neck like a hungry dragon. Time to MOVE!",
      type: 'deadline-warning',
      severity: 'savage',
      persona: 'default',
      triggers: { conditions: ['has_critical_tasks'] }
    },
    {
      id: 'deadline_critical_gordon',
      message: "WHAT ARE YOU DOING?! Your deadline is in {timeRemaining} and you're sitting there like a muppet! GET MOVING!",
      type: 'deadline-warning',
      severity: 'savage',
      persona: 'gordon',
      triggers: { conditions: ['has_critical_tasks'] }
    },
    {
      id: 'procrastination_pattern_1',
      message: "I've been watching your work patterns, and honestly? A sloth would be embarrassed by your productivity rate.",
      type: 'pattern-analysis',
      severity: 'medium',
      persona: 'default',
      triggers: { conditions: ['high_procrastination_risk'] }
    },
    {
      id: 'procrastination_pattern_mom',
      message: "Sweetie, I've noticed you keep putting off '{taskTitle}'. Remember what I always said about procrastination? It's like dirty laundry - it just piles up.",
      type: 'pattern-analysis',
      severity: 'gentle',
      persona: 'mom',
      triggers: { conditions: ['high_procrastination_risk'] }
    },
    {
      id: 'time_utilization_low',
      message: "You've used {timeUtilization}% of your allocated time for this task. At this rate, you'll finish sometime next century.",
      type: 'pattern-analysis',
      severity: 'medium',
      persona: 'default',
      triggers: { conditions: ['low_time_utilization'] }
    },
    {
      id: 'consistency_roast',
      message: "Your work consistency is more unpredictable than the weather. Maybe try showing up more than once a week?",
      type: 'roast',
      severity: 'medium',
      persona: 'passive-aggressive',
      triggers: { conditions: ['low_consistency'] }
    },
    {
      id: 'deadline_approaching_hr',
      message: "Per our timeline analysis, we're seeing some concerning KPIs around your deliverable completion rate. Let's circle back on this ASAP.",
      type: 'deadline-warning',
      severity: 'medium',
      persona: 'hr',
      triggers: { conditions: ['deadline_approaching'] }
    },
    {
      id: 'productive_hours_suggestion',
      message: "Based on your work patterns, you're most productive at {productiveHours}. Maybe try working then instead of... whatever this is?",
      type: 'pattern-analysis',
      severity: 'gentle',
      persona: 'default',
      triggers: { conditions: ['working_unproductive_hours'] }
    },
    {
      id: 'session_length_optimization',
      message: "Your average session length is {avgSession} minutes, but you keep trying {currentSession}-minute marathons. Work smarter, not harder.",
      type: 'pattern-analysis',
      severity: 'gentle',
      persona: 'default',
      triggers: { conditions: ['suboptimal_session_length'] }
    },
    {
      id: 'time_remaining_reality_check',
      message: "Reality check: You have {timeRemaining} left and {estimatedTime} of work remaining. Math isn't your strong suit, is it?",
      type: 'deadline-warning',
      severity: 'savage',
      persona: 'default',
      triggers: { conditions: ['insufficient_time_remaining'] }
    },

    // COMPLETION CELEBRATIONS WITH TIMELINE CONTEXT
    {
      id: 'completion_early_celebration',
      message: "Wow! You finished with {timeRemaining} to spare! I'm genuinely impressed. Did someone replace you with a productive clone?",
      type: 'completion',
      severity: 'gentle',
      persona: 'default',
      triggers: { taskStates: ['completed'], conditions: ['completed_early'] }
    },
    {
      id: 'completion_last_minute',
      message: "Cutting it close there, speed racer! Finished with {timeRemaining} left. Next time, maybe don't wait until the last possible moment?",
      type: 'completion',
      severity: 'medium',
      persona: 'default',
      triggers: { taskStates: ['completed'], conditions: ['completed_last_minute'] }
    },

    // EXISTING PROMPTS CONTINUE...
    {
      id: 'overdue_gentle_1',
      message: "Your overdue tasks called. They're feeling a bit neglected. Maybe show them some love?",
      type: 'roast',
      severity: 'gentle',
      persona: 'default',
      triggers: { conditions: ['has_overdue_tasks'] }
    },
    {
      id: 'overdue_savage_1',
      message: "Your overdue tasks have formed a support group. They meet every day to discuss their abandonment issues.",
      type: 'roast',
      severity: 'savage',
      persona: 'default',
      triggers: { conditions: ['has_overdue_tasks'] }
    },
    {
      id: 'completion_gentle_1',
      message: "Look who decided to be productive today! I'm genuinely impressed... and slightly suspicious.",
      type: 'completion',
      severity: 'gentle',
      persona: 'default',
      triggers: { taskStates: ['completed'] }
    },
    {
      id: 'completion_medium_1',
      message: "Well, well, well... someone actually finished something. Mark your calendars, folks!",
      type: 'completion',
      severity: 'medium',
      persona: 'default',
      triggers: { taskStates: ['completed'] }
    },
    {
      id: 'gordon_idle_1',
      message: "WHAT ARE YOU DOING?! Those tasks are RAW! Absolutely RAW! Get back in there and FINISH THEM!",
      type: 'nudge',
      severity: 'savage',
      persona: 'gordon',
      triggers: { minIdleTime: 45, conditions: ['has_pending_tasks'] }
    },
    {
      id: 'gordon_completion_1',
      message: "Finally! Some good f***ing productivity! You've redeemed yourself... barely.",
      type: 'completion',
      severity: 'medium',
      persona: 'gordon',
      triggers: { taskStates: ['completed'] }
    },
    {
      id: 'mom_idle_1',
      message: "Sweetie, I'm not angry, I'm just disappointed. Your tasks are waiting for you, and so am I.",
      type: 'nudge',
      severity: 'gentle',
      persona: 'mom',
      triggers: { minIdleTime: 40, conditions: ['has_pending_tasks'] }
    },
    {
      id: 'mom_completion_1',
      message: "I'm so proud of you! I knew you could do it. Now, don't you feel better about yourself?",
      type: 'completion',
      severity: 'gentle',
      persona: 'mom',
      triggers: { taskStates: ['completed'] }
    },
    {
      id: 'hr_idle_1',
      message: "Per our previous conversation regarding task completion, we need to circle back on your deliverables. Let's touch base ASAP.",
      type: 'nudge',
      severity: 'medium',
      persona: 'hr',
      triggers: { minIdleTime: 50, conditions: ['has_pending_tasks'] }
    },
    {
      id: 'hr_completion_1',
      message: "Excellent work! This really moves the needle on our KPIs. Let's leverage this momentum going forward.",
      type: 'completion',
      severity: 'gentle',
      persona: 'hr',
      triggers: { taskStates: ['completed'] }
    },
    {
      id: 'passive_idle_1',
      message: "Oh, don't mind me. I'll just be here... waiting... while your tasks collect dust. Take your time.",
      type: 'nudge',
      severity: 'medium',
      persona: 'passive-aggressive',
      triggers: { minIdleTime: 35, conditions: ['has_pending_tasks'] }
    },
    {
      id: 'passive_completion_1',
      message: "Wow, you actually finished something. I mean, it only took forever, but who's counting?",
      type: 'completion',
      severity: 'medium',
      persona: 'passive-aggressive',
      triggers: { taskStates: ['completed'] }
    }
  ];

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private getDayOfWeek(): 'weekday' | 'weekend' {
    const day = new Date().getDay();
    return (day === 0 || day === 6) ? 'weekend' : 'weekday';
  }

  private checkConditions(prompt: SarcasticPrompt, context: PromptContext): boolean {
    if (!prompt.triggers.conditions) return true;

    return prompt.triggers.conditions.every(condition => {
      switch (condition) {
        case 'has_pending_tasks':
          return context.taskCount > context.completedToday;
        case 'has_overdue_tasks':
          return context.overdueTasks > 0;
        case 'has_critical_tasks':
          return context.criticalTasks.length > 0;
        case 'high_procrastination_risk':
          return Array.from(context.taskAnalyses.values()).some(analysis => analysis.procrastinationRisk > 70);
        case 'low_time_utilization':
          return Array.from(context.taskAnalyses.values()).some(analysis => analysis.timeUtilization < 30);
        case 'low_consistency':
          return context.integrityScore < 70;
        case 'deadline_approaching':
          return context.criticalTasks.length > 0 || Array.from(context.taskAnalyses.values()).some(analysis => 
            analysis.urgencyLevel === 'high' || analysis.urgencyLevel === 'critical'
          );
        case 'insufficient_time_remaining':
          return Array.from(context.taskAnalyses.values()).some(analysis => 
            analysis.timeRemaining < 60 && analysis.progressRate < 50
          );
        case 'completed_early':
        case 'completed_last_minute':
          return true; // These are checked during completion
        case 'low_integrity':
          return context.integrityScore < 70;
        case 'high_streak':
          return context.currentStreak > 5;
        case 'morning':
          return context.timeOfDay === 'morning';
        case 'weekend':
          return context.dayOfWeek === 'weekend';
        default:
          return true;
      }
    });
  }

  private interpolateMessage(message: string, context: PromptContext, taskAnalysis?: TaskAnalysis, task?: Task): string {
    let interpolated = message;
    
    if (taskAnalysis) {
      interpolated = interpolated.replace('{timeRemaining}', this.formatTimeRemaining(taskAnalysis.timeRemaining));
      interpolated = interpolated.replace('{timeUtilization}', Math.round(taskAnalysis.timeUtilization).toString());
      interpolated = interpolated.replace('{procrastinationRisk}', Math.round(taskAnalysis.procrastinationRisk).toString());
    }
    
    if (task) {
      interpolated = interpolated.replace('{taskTitle}', task.title);
      interpolated = interpolated.replace('{estimatedTime}', this.formatTimeRemaining(task.estimatedTime || 60));
      
      if (task.workPattern) {
        interpolated = interpolated.replace('{avgSession}', Math.round(task.workPattern.averageSessionLength).toString());
        interpolated = interpolated.replace('{productiveHours}', task.workPattern.productiveHours.join(', '));
      }
    }
    
    return interpolated;
  }

  private formatTimeRemaining(minutes: number): string {
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
    return `${Math.round(minutes / 1440)} days`;
  }

  public generateContextualPrompt(context: PromptContext, userPersona: string = 'default'): SarcasticPrompt | null {
    // Priority 1: Critical deadline warnings
    if (context.criticalTasks.length > 0) {
      const criticalTask = context.criticalTasks[0];
      const analysis = context.taskAnalyses.get(criticalTask.id);
      
      const criticalPrompts = this.prompts.filter(p => 
        p.type === 'deadline-warning' && 
        p.persona === userPersona &&
        this.checkConditions(p, context)
      );
      
      if (criticalPrompts.length > 0) {
        const prompt = criticalPrompts[Math.floor(Math.random() * criticalPrompts.length)];
        return {
          ...prompt,
          message: this.interpolateMessage(prompt.message, context, analysis, criticalTask),
          taskContext: analysis ? {
            taskId: criticalTask.id,
            urgency: analysis.urgencyLevel,
            timeRemaining: analysis.timeRemaining,
            procrastinationRisk: analysis.procrastinationRisk
          } : undefined
        };
      }
    }

    // Priority 2: High procrastination risk tasks
    const highRiskTasks = context.procrastinatingTasks.filter(task => {
      const analysis = context.taskAnalyses.get(task.id);
      return analysis && analysis.procrastinationRisk > 70;
    });

    if (highRiskTasks.length > 0) {
      const riskTask = highRiskTasks[0];
      const analysis = context.taskAnalyses.get(riskTask.id);
      
      const riskPrompts = this.prompts.filter(p => 
        p.type === 'pattern-analysis' && 
        p.persona === userPersona &&
        this.checkConditions(p, context)
      );
      
      if (riskPrompts.length > 0) {
        const prompt = riskPrompts[Math.floor(Math.random() * riskPrompts.length)];
        return {
          ...prompt,
          message: this.interpolateMessage(prompt.message, context, analysis, riskTask),
          taskContext: analysis ? {
            taskId: riskTask.id,
            urgency: analysis.urgencyLevel,
            timeRemaining: analysis.timeRemaining,
            procrastinationRisk: analysis.procrastinationRisk
          } : undefined
        };
      }
    }

    // Priority 3: Regular idle nudges with escalating severity
    let type: 'nudge' | 'roast' | 'completion' = 'nudge';
    let severity: 'gentle' | 'medium' | 'savage' = 'medium';

    if (context.lastActivity) {
      const idleMinutes = (Date.now() - context.lastActivity.getTime()) / (1000 * 60);
      if (idleMinutes > 120) severity = 'savage';
      else if (idleMinutes > 60) severity = 'medium';
      else severity = 'gentle';
    }

    if (context.overdueTasks > 0) {
      type = 'roast';
      severity = context.overdueTasks > 3 ? 'savage' : 'medium';
    }

    return this.generatePrompt(context, type, userPersona, severity);
  }

  public generatePrompt(
    context: PromptContext, 
    type: 'nudge' | 'roast' | 'completion' | 'deadline-warning' | 'pattern-analysis' = 'nudge',
    persona: string = 'default',
    severity: 'gentle' | 'medium' | 'savage' = 'medium'
  ): SarcasticPrompt | null {
    
    const eligiblePrompts = this.prompts.filter(prompt => {
      if (prompt.type !== type) return false;
      if (prompt.persona !== persona) return false;
      
      const severityLevels = { gentle: 1, medium: 2, savage: 3 };
      if (severityLevels[prompt.severity] > severityLevels[severity]) return false;
      
      if (prompt.triggers.minIdleTime && context.lastActivity) {
        const idleMinutes = (Date.now() - context.lastActivity.getTime()) / (1000 * 60);
        if (idleMinutes < prompt.triggers.minIdleTime) return false;
      }
      
      if (!this.checkConditions(prompt, context)) return false;
      
      return true;
    });

    if (eligiblePrompts.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligiblePrompts.length);
    const selectedPrompt = eligiblePrompts[randomIndex];
    
    return {
      ...selectedPrompt,
      message: this.interpolateMessage(selectedPrompt.message, context)
    };
  }

  public generateCompletionPrompt(
    context: PromptContext, 
    completedTask: Task, 
    userPersona: string = 'default'
  ): SarcasticPrompt | null {
    const analysis = context.taskAnalyses.get(completedTask.id);
    
    // Determine completion context
    let completionType = 'normal';
    if (analysis && completedTask.dueDate) {
      const timeRemaining = analysis.timeRemaining;
      if (timeRemaining > 60 * 24) completionType = 'early'; // More than a day early
      else if (timeRemaining < 60) completionType = 'last_minute'; // Less than an hour
    }

    const completionPrompts = this.prompts.filter(p => 
      p.type === 'completion' && 
      p.persona === userPersona &&
      (completionType === 'normal' || p.triggers.conditions?.includes(`completed_${completionType}`))
    );

    if (completionPrompts.length === 0) return null;

    const prompt = completionPrompts[Math.floor(Math.random() * completionPrompts.length)];
    return {
      ...prompt,
      message: this.interpolateMessage(prompt.message, context, analysis, completedTask),
      taskContext: analysis ? {
        taskId: completedTask.id,
        urgency: analysis.urgencyLevel,
        timeRemaining: analysis.timeRemaining,
        procrastinationRisk: analysis.procrastinationRisk
      } : undefined
    };
  }

  public getAvailablePersonas(): string[] {
    return ['default', 'gordon', 'mom', 'hr', 'passive-aggressive'];
  }

  public addCustomPrompt(prompt: Omit<SarcasticPrompt, 'id'>): void {
    const newPrompt: SarcasticPrompt = {
      ...prompt,
      id: `custom_${Date.now()}`
    };
    this.prompts.push(newPrompt);
  }
}

export const sarcasticEngine = new SarcasticPromptEngine();