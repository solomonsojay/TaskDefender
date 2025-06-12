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
      id: 'completion_gentle_1',
      message: "Look who decided to be productive today! I'm genuinely impressed... and slightly suspicious.",
      type: 'completion',
      severity: 'gentle',
      persona: 'default',
      triggers: { taskStates: ['completed'] }
    }
  ];

  public generateContextualPrompt(context: PromptContext, userPersona: string = 'default'): SarcasticPrompt | null {
    const eligiblePrompts = this.prompts.filter(prompt => {
      if (prompt.persona !== userPersona) return false;
      return this.checkConditions(prompt, context);
    });

    if (eligiblePrompts.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligiblePrompts.length);
    return eligiblePrompts[randomIndex];
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
      return true;
    });

    if (eligiblePrompts.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligiblePrompts.length);
    return eligiblePrompts[randomIndex];
  }

  public generateCompletionPrompt(
    context: PromptContext, 
    completedTask: Task, 
    userPersona: string = 'default'
  ): SarcasticPrompt | null {
    return this.generatePrompt(context, 'completion', userPersona);
  }

  public getAvailablePersonas(): string[] {
    return ['default', 'gordon', 'mom', 'hr', 'passive-aggressive'];
  }

  private checkConditions(prompt: SarcasticPrompt, context: PromptContext): boolean {
    if (!prompt.triggers.conditions) return true;

    return prompt.triggers.conditions.every(condition => {
      switch (condition) {
        case 'has_pending_tasks':
          return context.taskCount > context.completedToday;
        case 'has_overdue_tasks':
          return context.overdueTasks > 0;
        default:
          return true;
      }
    });
  }
}

export const sarcasticEngine = new SarcasticPromptEngine();