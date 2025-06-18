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
    
    // Create a mock prompt for testing
    const mockPrompt: SarcasticPrompt = {
      id: `nudge_${Date.now()}`,
      message: getRandomNudgeMessage(userPersona, context),
      type: 'nudge',
      severity: 'medium',
      persona: userPersona as any,
      triggers: { minIdleTime: 30, conditions: ['has_pending_tasks'] }
    };
    
    setCurrentPrompt(mockPrompt);
    setPromptHistory(prev => [mockPrompt, ...prev.slice(0, 9)]);
  }, [generateContext, userPersona]);

  // Generate completion celebration with timeline context
  const celebrateCompletion = useCallback((completedTask?: any) => {
    const context = generateContext();
    
    const mockPrompt: SarcasticPrompt = {
      id: `completion_${Date.now()}`,
      message: getRandomCompletionMessage(userPersona, context),
      type: 'completion',
      severity: 'gentle',
      persona: userPersona as any,
      triggers: { taskStates: ['completed'] }
    };
    
    setCurrentPrompt(mockPrompt);
    setPromptHistory(prev => [mockPrompt, ...prev.slice(0, 9)]);
  }, [generateContext, userPersona]);

  // Generate roast for poor performance
  const generateRoast = useCallback(() => {
    const context = generateContext();
    
    const mockPrompt: SarcasticPrompt = {
      id: `roast_${Date.now()}`,
      message: getRandomRoastMessage(userPersona, context),
      type: 'roast',
      severity: 'savage',
      persona: userPersona as any,
      triggers: { conditions: ['poor_performance'] }
    };
    
    setCurrentPrompt(mockPrompt);
    setPromptHistory(prev => [mockPrompt, ...prev.slice(0, 9)]);
  }, [generateContext, userPersona]);

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
    // Analytics functions
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

// Helper functions for generating messages
function getRandomNudgeMessage(persona: string, context: PromptContext): string {
  const messages = {
    default: [
      "Those tasks aren't going to complete themselves... unless you've invented self-doing work. Have you?",
      "I see you're practicing the ancient art of 'productive procrastination.' How's that working out for you?",
      "Your tasks are getting lonely. They miss being worked on.",
      "Time to stop scrolling and start accomplishing. Your future self will thank you."
    ],
    gordon: [
      "RIGHT! What are you doing sitting there like a muppet?!",
      "Listen here, you donkey! Your tasks are RAW! Absolutely RAW!",
      "WHAT ARE YOU WAITING FOR?! Christmas?! GET MOVING!",
      "This is absolutely PATHETIC! You call this productivity?!"
    ],
    mom: [
      "Sweetie, I'm not angry, I'm just disappointed. Your tasks are waiting for you.",
      "Honey, remember what I always said about procrastination? It's like dirty laundry...",
      "I know you can do better than this. You're my smart child, remember?",
      "Dear, those tasks won't complete themselves. Time to get moving!"
    ],
    hr: [
      "We need to circle back on your deliverable timeline and optimize your bandwidth allocation.",
      "Let's synergize your efforts to maximize your output potential and drive results.",
      "This is a high-priority action item that requires immediate bandwidth allocation.",
      "We need to leverage your core competencies to move the needle on these tasks."
    ],
    'passive-aggressive': [
      "Oh, you're still on that task? That's... interesting. Take your time!",
      "I mean, I'm sure you have your reasons for not working on your tasks...",
      "It's totally fine that you're taking your time. Some people work differently.",
      "I'm sure you're aware your tasks are waiting. Not that I'm worried or anything."
    ]
  };

  const personaMessages = messages[persona as keyof typeof messages] || messages.default;
  return personaMessages[Math.floor(Math.random() * personaMessages.length)];
}

function getRandomCompletionMessage(persona: string, context: PromptContext): string {
  const messages = {
    default: [
      "Look who decided to be productive today! I'm genuinely impressed... and slightly suspicious.",
      "Task completed! Your productivity score just got a nice boost.",
      "Well done! That's the kind of progress I like to see.",
      "Excellent work! I knew you had it in you."
    ],
    gordon: [
      "Finally! Some good productivity! You've redeemed yourself... barely.",
      "Well done! That's what I'm talking about! More of that!",
      "BRILLIANT! Now that's how you get things done properly!",
      "About bloody time! Keep this momentum going!"
    ],
    mom: [
      "I'm so proud of you! I knew you could do it!",
      "That's my child! You make your mother so happy when you succeed.",
      "See? I told you that you were capable of great things!",
      "Wonderful job, sweetie! Mom is beaming with pride!"
    ],
    hr: [
      "Excellent work! This really moves the needle on our productivity metrics.",
      "Outstanding! You've exceeded expectations and delivered value-added results.",
      "Great job! This aligns perfectly with our strategic objectives.",
      "Impressive deliverable! You've really optimized your performance KPIs."
    ],
    'passive-aggressive': [
      "Wow, you actually finished! I mean, it only took forever, but who's counting?",
      "Look at you being all productive! Better late than never, I suppose.",
      "Congratulations! You did the thing you were supposed to do. Amazing!",
      "Oh, you completed a task? How... unexpected. Good for you!"
    ]
  };

  const personaMessages = messages[persona as keyof typeof messages] || messages.default;
  return personaMessages[Math.floor(Math.random() * personaMessages.length)];
}

function getRandomRoastMessage(persona: string, context: PromptContext): string {
  const messages = {
    default: [
      "Your procrastination skills are truly impressive. Too bad they don't pay the bills.",
      "I've seen glaciers move faster than your task completion rate.",
      "Your tasks called. They want to know if you've forgotten about them entirely.",
      "At this rate, your deadlines will become historical events."
    ],
    gordon: [
      "This is absolutely PATHETIC! You call this productivity?!",
      "I've seen snails move faster than your task completion rate!",
      "GET YOUR HEAD OUT OF THE CLOUDS AND FOCUS!",
      "You're moving slower than a Sunday roast! WAKE UP!"
    ],
    mom: [
      "I'm not angry, I'm just disappointed. Very, very disappointed.",
      "This is not the child I raised. Where did I go wrong?",
      "Your grandmother would be rolling in her grave if she saw this productivity.",
      "I expected better from you. Much better."
    ],
    hr: [
      "Your performance metrics are significantly below our baseline expectations.",
      "We need to have a serious conversation about your deliverable timeline.",
      "This level of output is not aligned with our organizational objectives.",
      "Your productivity KPIs require immediate strategic intervention."
    ],
    'passive-aggressive': [
      "Oh, you're still working on that? How... thorough of you.",
      "I'm sure you'll get to those tasks eventually. No rush!",
      "Your dedication to taking your time is truly admirable.",
      "It's fascinating how you've redefined the concept of 'urgent'."
    ]
  };

  const personaMessages = messages[persona as keyof typeof messages] || messages.default;
  return personaMessages[Math.floor(Math.random() * personaMessages.length)];
}