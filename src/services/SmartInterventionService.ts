import { Task, DefenseAction, VoiceSettings } from '../types';
import { generateSecureId, validateTaskData } from '../utils/validation';

export class SmartInterventionService {
  private static instance: SmartInterventionService;
  private interventionTimer: number | null = null;
  private voiceSettings: VoiceSettings | null = null;
  private activeInterventions: Map<string, number> = new Map();
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): SmartInterventionService {
    if (!SmartInterventionService.instance) {
      SmartInterventionService.instance = new SmartInterventionService();
    }
    return SmartInterventionService.instance;
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.loadVoiceSettings();
      this.startInterventionMonitoring();
      this.isInitialized = true;
      console.log('✅ SmartInterventionService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SmartInterventionService:', error);
    }
  }

  private loadVoiceSettings() {
    try {
      const saved = localStorage.getItem('taskdefender_voice_settings');
      if (saved) {
        this.voiceSettings = JSON.parse(saved);
      } else {
        // Set default voice settings
        this.voiceSettings = {
          enableCalls: true,
          callFrequency: 'normal',
          selectedCharacter: 'default',
          customCharacterName: 'Custom Assistant',
          customPrompts: [],
          customVoiceBlob: null,
          selectedVoice: 'en-US-female',
          callInterval: 20
        };
      }
    } catch (error) {
      console.error('Failed to load voice settings:', error);
      // Use default settings on error
      this.voiceSettings = {
        enableCalls: true,
        callFrequency: 'normal',
        selectedCharacter: 'default',
        customCharacterName: 'Custom Assistant',
        customPrompts: [],
        customVoiceBlob: null,
        selectedVoice: 'en-US-female',
        callInterval: 20
      };
    }
  }

  private startInterventionMonitoring() {
    // Clear existing timer
    if (this.interventionTimer) {
      window.clearInterval(this.interventionTimer);
    }

    // Check every 5 minutes for interventions
    this.interventionTimer = window.setInterval(() => {
      this.checkTasksForIntervention();
    }, 5 * 60 * 1000);
  }

  private checkTasksForIntervention() {
    try {
      const tasks = this.getActiveTasks();
      
      tasks.forEach(task => {
        const interventionLevel = this.calculateInterventionLevel(task);
        if (interventionLevel > 0) {
          this.scheduleIntervention(task, interventionLevel);
        }
      });
    } catch (error) {
      console.error('Error checking tasks for intervention:', error);
    }
  }

  private getActiveTasks(): Task[] {
    try {
      const userData = localStorage.getItem('taskdefender_current_user');
      if (!userData) return [];
      
      const user = JSON.parse(userData);
      const saved = localStorage.getItem(`taskdefender_tasks_${user.id}`);
      if (!saved) return [];
      
      const tasks = JSON.parse(saved).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
      
      return tasks.filter((task: Task) => {
        // Validate task data
        const validation = validateTaskData(task);
        if (!validation.isValid) {
          console.warn('Invalid task data in intervention check:', validation.errors);
          return false;
        }
        
        return task.status !== 'done' && task.dueDate;
      });
    } catch (error) {
      console.error('Failed to load tasks for intervention:', error);
      return [];
    }
  }

  private calculateInterventionLevel(task: Task): number {
    if (!task.dueDate || task.status === 'done') return 0;
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    
    // Calculate time progress (0 to 1)
    const totalTime = dueDate.getTime() - createdDate.getTime();
    const elapsedTime = now.getTime() - createdDate.getTime();
    const timeProgress = Math.min(1, Math.max(0, elapsedTime / totalTime));
    
    // Start interventions at 50% progress
    if (timeProgress < 0.5) return 0;
    
    // Intervention levels:
    // 0.5-0.7 (50-70%): Level 1 - Gentle reminders
    // 0.7-0.85 (70-85%): Level 2 - Moderate interventions
    // 0.85-0.95 (85-95%): Level 3 - Urgent interventions
    // 0.95+ (95%+): Level 4 - Emergency interventions
    
    if (timeProgress >= 0.95) return 4;
    if (timeProgress >= 0.85) return 3;
    if (timeProgress >= 0.7) return 2;
    if (timeProgress >= 0.5) return 1;
    
    return 0;
  }

  private scheduleIntervention(task: Task, level: number) {
    const taskId = task.id;
    
    // Clear existing intervention for this task
    if (this.activeInterventions.has(taskId)) {
      window.clearTimeout(this.activeInterventions.get(taskId)!);
    }
    
    // Calculate intervention frequency based on level
    const frequencies = {
      1: 60 * 60 * 1000, // 1 hour
      2: 30 * 60 * 1000, // 30 minutes
      3: 15 * 60 * 1000, // 15 minutes
      4: 5 * 60 * 1000   // 5 minutes
    };
    
    const frequency = frequencies[level as keyof typeof frequencies];
    
    // Schedule intervention
    const timeout = window.setTimeout(() => {
      this.triggerIntervention(task, level);
      // Reschedule for next intervention
      this.scheduleIntervention(task, level);
    }, frequency);
    
    this.activeInterventions.set(taskId, timeout);
  }

  private async triggerIntervention(task: Task, level: number) {
    if (!this.voiceSettings?.enableCalls) return;
    
    try {
      const messages = this.getInterventionMessages(task, level);
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      // Style message for selected character
      const styledMessage = this.styleMessageForCharacter(message, this.voiceSettings.selectedCharacter);
      
      // Make voice call
      await this.makeVoiceCall(styledMessage, level);
      
      // Show visual notification
      this.showInterventionNotification(task, styledMessage, level);
      
      // Log intervention
      this.logIntervention(task, level, styledMessage);
    } catch (error) {
      console.error('Error triggering intervention:', error);
    }
  }

  private getInterventionMessages(task: Task, level: number): string[] {
    const taskTitle = task.title;
    
    switch (level) {
      case 1: // 50-70% - Gentle reminders
        return [
          `Hey! Just a friendly reminder about "${taskTitle}". You're halfway to the deadline!`,
          `Time check! "${taskTitle}" is waiting for your attention.`,
          `Don't forget about "${taskTitle}" - you still have time to complete it properly!`
        ];
      
      case 2: // 70-85% - Moderate interventions
        return [
          `Attention! "${taskTitle}" is getting close to its deadline. Time to focus!`,
          `Warning: "${taskTitle}" needs your immediate attention. Let's get it done!`,
          `TaskDefender Alert: "${taskTitle}" is approaching critical status!`
        ];
      
      case 3: // 85-95% - Urgent interventions
        return [
          `URGENT: "${taskTitle}" is almost due! Drop everything and work on this now!`,
          `RED ALERT: "${taskTitle}" deadline is imminent! This is your last chance!`,
          `CRITICAL: "${taskTitle}" must be completed immediately or you'll miss the deadline!`
        ];
      
      case 4: // 95%+ - Emergency interventions
        return [
          `EMERGENCY! "${taskTitle}" deadline is NOW! Stop procrastinating immediately!`,
          `FINAL WARNING: "${taskTitle}" is overdue or about to be! Act NOW!`,
          `LAST LINE OF DEFENSE ACTIVATED: "${taskTitle}" requires immediate action!`
        ];
      
      default:
        return [`Time to work on "${taskTitle}"!`];
    }
  }

  private styleMessageForCharacter(message: string, character: string): string {
    switch (character) {
      case 'mom':
        return `Honey, ${message.toLowerCase()} I'm not angry, just disappointed. You know you can do better than this.`;
      
      case 'coach':
        return `LISTEN UP CHAMPION! ${message.toUpperCase()} NO EXCUSES! WINNERS DON'T PROCRASTINATE!`;
      
      case 'custom':
        // Use custom prompts if available
        if (this.voiceSettings?.customPrompts && this.voiceSettings.customPrompts.length > 0) {
          const customPrompts = this.voiceSettings.customPrompts;
          return customPrompts[Math.floor(Math.random() * customPrompts.length)];
        }
        return message;
      
      default:
        return `Hey there! ${message} Remember, I'm your last line of defense against procrastination!`;
    }
  }

  private async makeVoiceCall(message: string, level: number) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Configure voice based on settings
      const voices = speechSynthesis.getVoices();
      if (this.voiceSettings?.selectedVoice && this.voiceSettings.selectedVoice !== 'custom') {
        const voiceParts = this.voiceSettings.selectedVoice.split('-');
        const lang = voiceParts.slice(0, 2).join('-');
        const gender = voiceParts[2];
        
        const selectedVoice = voices.find(voice => 
          voice.lang.includes(lang) &&
          (gender === 'female' ? 
            voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') :
            voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man'))
        );
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      // Adjust speech parameters based on intervention level
      utterance.rate = level >= 3 ? 1.3 : level >= 2 ? 1.1 : 1.0;
      utterance.pitch = level >= 3 ? 1.2 : level >= 2 ? 1.1 : 1.0;
      utterance.volume = level >= 3 ? 1.0 : 0.8;
      
      // Character-specific adjustments
      if (this.voiceSettings?.selectedCharacter === 'mom') {
        utterance.rate *= 0.9;
        utterance.pitch *= 1.1;
      } else if (this.voiceSettings?.selectedCharacter === 'coach') {
        utterance.rate *= 1.2;
        utterance.pitch *= 0.9;
        utterance.volume = 1.0;
      }
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error making voice call:', error);
    }
  }

  private showInterventionNotification(task: Task, message: string, level: number) {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('TaskDefender Intervention', {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `intervention-${task.id}`,
          requireInteraction: level >= 3
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
    
    // Visual modal for high-level interventions
    if (level >= 3) {
      this.showInterventionModal(task, message, level);
    }
  }

  private showInterventionModal(task: Task, message: string, level: number) {
    try {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-pulse">
          <div class="text-center mb-6">
            <div class="bg-red-100 dark:bg-red-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
              <svg class="h-10 w-10 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ${level === 4 ? 'EMERGENCY INTERVENTION' : 'URGENT INTERVENTION'}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              ${message}
            </p>
          </div>
          <div class="space-y-3">
            <button onclick="this.parentElement.parentElement.parentElement.remove()" class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200">
              I'll work on it RIGHT NOW!
            </button>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
              Snooze for 5 minutes
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Auto-remove after 60 seconds for emergency, 30 for urgent
      window.setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, level === 4 ? 60000 : 30000);
    } catch (error) {
      console.error('Error showing intervention modal:', error);
    }
  }

  private logIntervention(task: Task, level: number, message: string) {
    try {
      const intervention = {
        id: generateSecureId(),
        taskId: task.id,
        level,
        message,
        timestamp: new Date(),
        character: this.voiceSettings?.selectedCharacter || 'default'
      };
      
      const history = this.getInterventionHistory();
      history.push(intervention);
      
      // Keep only last 100 interventions
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      localStorage.setItem('taskdefender_intervention_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error logging intervention:', error);
    }
  }

  private getInterventionHistory(): any[] {
    try {
      const saved = localStorage.getItem('taskdefender_intervention_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load intervention history:', error);
      return [];
    }
  }

  public clearInterventionForTask(taskId: string) {
    if (this.activeInterventions.has(taskId)) {
      window.clearTimeout(this.activeInterventions.get(taskId)!);
      this.activeInterventions.delete(taskId);
    }
  }

  public updateVoiceSettings(settings: VoiceSettings) {
    this.voiceSettings = settings;
    try {
      localStorage.setItem('taskdefender_voice_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save voice settings:', error);
    }
  }

  public triggerManualDefense(taskId: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    try {
      const tasks = this.getActiveTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        const level = severity === 'critical' ? 4 : severity === 'high' ? 3 : severity === 'medium' ? 2 : 1;
        this.triggerIntervention(task, level);
      }
    } catch (error) {
      console.error('Error triggering manual defense:', error);
    }
  }

  public getInterventionStats() {
    try {
      const history = this.getInterventionHistory();
      const last24Hours = history.filter((intervention: any) => 
        new Date(intervention.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      return {
        totalInterventions: history.length,
        last24Hours: last24Hours.length,
        averageLevel: history.length > 0 ? 
          history.reduce((sum: number, i: any) => sum + i.level, 0) / history.length : 0
      };
    } catch (error) {
      console.error('Error getting intervention stats:', error);
      return {
        totalInterventions: 0,
        last24Hours: 0,
        averageLevel: 0
      };
    }
  }

  public destroy() {
    if (this.interventionTimer) {
      window.clearInterval(this.interventionTimer);
      this.interventionTimer = null;
    }
    
    this.activeInterventions.forEach(timeout => window.clearTimeout(timeout));
    this.activeInterventions.clear();
    this.isInitialized = false;
  }
}

// Initialize the intervention service
export const smartInterventionService = SmartInterventionService.getInstance();