import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { sarcasticEngine, PromptContext, SarcasticPrompt } from '../services/SarcasticPromptEngine';
import { workPatternAnalyzer, TaskAnalysis } from '../services/WorkPatternAnalyzer';

export const useSarcasticPrompts = () => {
  const { user, tasks } = useApp();
  const [currentPrompt, setCurrentPrompt] = useState<SarcasticPrompt | null>(null);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [userPersona, setUserPersona] = useState<string>('default');
  const [promptHistory, setPromptHistory] = useState<SarcasticPrompt[]>([]);

  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    setLastActivity(new Date());
  }, []);

  // Generate enhanced prompt context with task analysis
  const generateContext = useCallback((): PromptContext => {
    const today = new Date();
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate.toDateString() === today.toDateString();
    });

    const completedToday = todayTasks.filter(task => task.status === 'done').length;
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      return new Date(task.dueDate) < new Date();
    }).length;

    // Analyze all active tasks
    const taskAnalyses = new Map<string, TaskAnalysis>();
    const criticalTasks: typeof tasks = [];
    const procrastinatingTasks: typeof tasks = [];

    tasks.forEach(task => {
      if (task.status === 'done') return;
      
      const analysis = workPatternAnalyzer.analyzeTask(task);
      taskAnalyses.set(task.id, analysis);
      
      if (analysis.urgencyLevel === 'critical') {
        criticalTasks.push(task);
      }
      
      if (analysis.procrastinationRisk > 60) {
        procrastinatingTasks.push(task);
      }
    });

    const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
      const hour = new Date().getHours();
      if (hour < 12) return 'morning';
      if (hour < 17) return 'afternoon';
      if (hour < 21) return 'evening';
      return 'night';
    };

    const getDayOfWeek = (): 'weekday' | 'weekend' => {
      const day = new Date().getDay();
      return (day === 0 || day === 6) ? 'weekend' : 'weekday';
    };

    return {
      taskCount: tasks.length,
      completedToday,
      overdueTasks,
      lastActivity,
      currentStreak: user?.streak || 0,
      integrityScore: user?.integrityScore || 100,
      timeOfDay: getTimeOfDay(),
      dayOfWeek: getDayOfWeek(),
      criticalTasks,
      procrastinatingTasks,
      taskAnalyses
    };
  }, [tasks, user, lastActivity]);

  // Generate nudge prompts for idle users
  const generateNudge = useCallback(() => {
    const context = generateContext();
    const prompt = sarcasticEngine.generateContextualPrompt(context, userPersona);
    
    if (prompt && (prompt.type === 'nudge' || prompt.type === 'deadline-warning' || prompt.type === 'pattern-analysis')) {
      setCurrentPrompt(prompt);
      setPromptHistory(prev => [prompt, ...prev.slice(0, 9)]); // Keep last 10
    }
  }, [generateContext, userPersona]);

  // Generate completion celebration with timeline context
  const celebrateCompletion = useCallback((completedTask?: any) => {
    const context = generateContext();
    
    if (completedTask) {
      const prompt = sarcasticEngine.generateCompletionPrompt(context, completedTask, userPersona);
      if (prompt) {
        setCurrentPrompt(prompt);
        setPromptHistory(prev => [prompt, ...prev.slice(0, 9)]);
      }
    } else {
      const prompt = sarcasticEngine.generatePrompt(context, 'completion', userPersona);
      if (prompt) {
        setCurrentPrompt(prompt);
        setPromptHistory(prev => [prompt, ...prev.slice(0, 9)]);
      }
    }
  }, [generateContext, userPersona]);

  // Generate roast for poor performance
  const generateRoast = useCallback(() => {
    const context = generateContext();
    const prompt = sarcasticEngine.generatePrompt(context, 'roast', userPersona, 'savage');
    
    if (prompt) {
      setCurrentPrompt(prompt);
      setPromptHistory(prev => [prompt, ...prev.slice(0, 9)]);
    }
  }, [generateContext, userPersona]);

  // Enhanced idle detection with task-specific analysis
  useEffect(() => {
    const checkForNudges = () => {
      const context = generateContext();
      
      // Priority 1: Critical deadline warnings
      if (context.criticalTasks.length > 0) {
        generateNudge();
        return;
      }
      
      // Priority 2: High procrastination risk tasks
      const highRiskTasks = context.procrastinatingTasks.filter(task => {
        const analysis = context.taskAnalyses.get(task.id);
        return analysis && analysis.procrastinationRisk > 80;
      });
      
      if (highRiskTasks.length > 0) {
        generateNudge();
        return;
      }
      
      // Priority 3: Regular idle nudges
      if (context.taskCount > context.completedToday) {
        const idleMinutes = (Date.now() - lastActivity.getTime()) / (1000 * 60);
        
        // More aggressive nudging for users with pending deadlines
        const hasUpcomingDeadlines = Array.from(context.taskAnalyses.values()).some(
          analysis => analysis.urgencyLevel === 'high' || analysis.urgencyLevel === 'critical'
        );
        
        const nudgeThresholds = hasUpcomingDeadlines ? [20, 40, 80] : [30, 60, 120];
        
        if (idleMinutes >= nudgeThresholds[0] && idleMinutes < nudgeThresholds[0] + 5) {
          generateNudge();
        } else if (idleMinutes >= nudgeThresholds[1] && idleMinutes < nudgeThresholds[1] + 5) {
          generateNudge();
        } else if (idleMinutes >= nudgeThresholds[2] && idleMinutes < nudgeThresholds[2] + 5) {
          generateRoast();
        }
      }
    };

    // Check every 5 minutes, but more frequently if there are critical tasks
    const context = generateContext();
    const checkInterval = context.criticalTasks.length > 0 ? 2 * 60 * 1000 : 5 * 60 * 1000;
    
    const interval = setInterval(checkForNudges, checkInterval);
    
    return () => clearInterval(interval);
  }, [generateContext, generateNudge, generateRoast, lastActivity]);

  // Listen for task completions to trigger celebrations
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.status === 'done');
    const previousCompletedCount = promptHistory.filter(p => p.type === 'completion').length;
    
    if (completedTasks.length > previousCompletedCount) {
      // Find the most recently completed task
      const recentlyCompleted = completedTasks
        .filter(task => task.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
      
      celebrateCompletion(recentlyCompleted);
    }
  }, [tasks, celebrateCompletion, promptHistory]);

  // Periodic deadline checks (every hour)
  useEffect(() => {
    const checkDeadlines = () => {
      const context = generateContext();
      
      // Check for tasks approaching deadlines
      const approachingDeadlines = Array.from(context.taskAnalyses.entries())
        .filter(([_, analysis]) => 
          analysis.urgencyLevel === 'high' && 
          analysis.timeRemaining < 4 * 60 // Less than 4 hours
        );
      
      if (approachingDeadlines.length > 0) {
        generateNudge();
      }
    };

    const interval = setInterval(checkDeadlines, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, [generateContext, generateNudge]);

  const dismissPrompt = useCallback(() => {
    setCurrentPrompt(null);
  }, []);

  const changePersona = useCallback((persona: string) => {
    setUserPersona(persona);
    localStorage.setItem('taskdefender_persona', persona);
  }, []);

  // Load saved persona on mount
  useEffect(() => {
    const savedPersona = localStorage.getItem('taskdefender_persona');
    if (savedPersona) {
      setUserPersona(savedPersona);
    }
  }, []);

  return {
    currentPrompt,
    promptHistory,
    userPersona,
    updateActivity,
    dismissPrompt,
    changePersona,
    generateNudge,
    celebrateCompletion,
    generateRoast,
    availablePersonas: sarcasticEngine.getAvailablePersonas(),
    // New analytics functions
    getTaskAnalysis: (taskId: string) => {
      const context = generateContext();
      return context.taskAnalyses.get(taskId);
    },
    getCriticalTasks: () => {
      const context = generateContext();
      return context.criticalTasks;
    },
    getProcrastinatingTasks: () => {
      const context = generateContext();
      return context.procrastinatingTasks;
    }
  };
};