import { Task, DefenseAction, VoiceSettings } from '../types';

export class TaskDefenseService {
  private static instance: TaskDefenseService;
  private defenseTimer: NodeJS.Timeout | null = null;
  private voiceSettings: VoiceSettings | null = null;

  private constructor() {
    this.loadVoiceSettings();
    this.startDefenseMonitoring();
  }

  static getInstance(): TaskDefenseService {
    if (!TaskDefenseService.instance) {
      TaskDefenseService.instance = new TaskDefenseService();
    }
    return TaskDefenseService.instance;
  }

  private loadVoiceSettings() {
    const saved = localStorage.getItem('taskdefender_voice_settings');
    if (saved) {
      try {
        this.voiceSettings = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load voice settings:', error);
      }
    }
  }

  private startDefenseMonitoring() {
    // Monitor tasks every minute
    this.defenseTimer = setInterval(() => {
      this.checkTasksForDefense();
    }, 60000);
  }

  private checkTasksForDefense() {
    const tasks = this.getActiveTasks();
    
    tasks.forEach(task => {
      if (this.shouldTriggerDefense(task)) {
        this.triggerDefenseAction(task);
      }
    });
  }

  private getActiveTasks(): Task[] {
    const saved = localStorage.getItem('taskdefender_tasks');
    if (!saved) return [];
    
    try {
      const tasks = JSON.parse(saved).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        expectedCompletionTime: task.expectedCompletionTime ? new Date(task.expectedCompletionTime) : undefined,
        scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : undefined
      }));
      
      return tasks.filter((task: Task) => 
        task.status !== 'done' && 
        task.isDefenseActive
      );
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  }

  private shouldTriggerDefense(task: Task): boolean {
    const now = new Date();
    
    // Check if task is overdue
    if (task.dueDate && now > task.dueDate) {
      return true;
    }
    
    // Check if task is approaching deadline (critical/at-risk)
    if (task.dueDate) {
      const timeLeft = task.dueDate.getTime() - now.getTime();
      const totalTime = task.dueDate.getTime() - new Date(task.createdAt).getTime();
      const timeRatio = timeLeft / totalTime;
      
      if (timeRatio <= 0.1) { // At risk (10% time left)
        return true;
      }
      
      if (timeRatio <= 0.2 && task.priority === 'urgent') { // Critical urgent tasks
        return true;
      }
    }
    
    // Check if scheduled time has passed
    if (task.scheduledTime && now > task.scheduledTime) {
      const timePassed = now.getTime() - task.scheduledTime.getTime();
      if (timePassed > 30 * 60 * 1000) { // 30 minutes past scheduled time
        return true;
      }
    }
    
    // Check procrastination count
    if (task.procrastinationCount && task.procrastinationCount >= 3) {
      return true;
    }
    
    return false;
  }

  private async triggerDefenseAction(task: Task) {
    const severity = this.calculateSeverity(task);
    const action = this.createDefenseAction(task, severity);
    
    // Execute the defense action
    await this.executeDefenseAction(action);
    
    // Log the action
    this.logDefenseAction(action);
  }

  private calculateSeverity(task: Task): 'low' | 'medium' | 'high' | 'critical' {
    const now = new Date();
    
    // Critical: Overdue urgent tasks or high procrastination
    if ((task.dueDate && now > task.dueDate && task.priority === 'urgent') ||
        (task.procrastinationCount && task.procrastinationCount >= 5)) {
      return 'critical';
    }
    
    // High: Overdue tasks or at-risk urgent tasks
    if ((task.dueDate && now > task.dueDate) ||
        (task.dueDate && task.priority === 'urgent' && this.isAtRisk(task))) {
      return 'high';
    }
    
    // Medium: At-risk tasks or moderate procrastination
    if (this.isAtRisk(task) || (task.procrastinationCount && task.procrastinationCount >= 2)) {
      return 'medium';
    }
    
    return 'low';
  }

  private isAtRisk(task: Task): boolean {
    if (!task.dueDate) return false;
    
    const now = new Date();
    const timeLeft = task.dueDate.getTime() - now.getTime();
    const totalTime = task.dueDate.getTime() - new Date(task.createdAt).getTime();
    
    return (timeLeft / totalTime) <= 0.1;
  }

  private createDefenseAction(task: Task, severity: 'low' | 'medium' | 'high' | 'critical'): DefenseAction {
    const messages = this.getDefenseMessages(task, severity);
    const actionType = severity === 'critical' ? 'emergency_call' : 
                     severity === 'high' ? 'voice_call' : 
                     severity === 'medium' ? 'intervention' : 'notification';
    
    return {
      id: Date.now().toString(),
      taskId: task.id,
      actionType,
      severity,
      message: messages[Math.floor(Math.random() * messages.length)],
      triggeredAt: new Date()
    };
  }

  private getDefenseMessages(task: Task, severity: 'low' | 'medium' | 'high' | 'critical'): string[] {
    const taskTitle = task.title;
    
    switch (severity) {
      case 'critical':
        return [
          `🚨 EMERGENCY DEFENSE ACTIVATED! Task "${taskTitle}" is critically overdue! This is your last line of defense against procrastination!`,
          `⚡ CRITICAL ALERT: You're in danger of failing "${taskTitle}"! TaskDefender is intervening NOW!`,
          `🛡️ DEFENSE PROTOCOL CRITICAL: Task "${taskTitle}" requires IMMEDIATE action! No more excuses!`
        ];
      
      case 'high':
        return [
          `🔥 HIGH PRIORITY DEFENSE: Task "${taskTitle}" is at risk! Time to take action!`,
          `⚠️ TaskDefender Alert: "${taskTitle}" needs your attention NOW!`,
          `🎯 Defense Mode: You're falling behind on "${taskTitle}". Let's get back on track!`
        ];
      
      case 'medium':
        return [
          `🛡️ TaskDefender Reminder: "${taskTitle}" is waiting for you!`,
          `⏰ Gentle Defense: Time to work on "${taskTitle}" before it becomes urgent!`,
          `🎯 Productivity Check: "${taskTitle}" could use some attention!`
        ];
      
      default:
        return [
          `📝 TaskDefender: Don't forget about "${taskTitle}"!`,
          `🎯 Friendly reminder: "${taskTitle}" is on your list!`,
          `⭐ TaskDefender: Ready to tackle "${taskTitle}"?`
        ];
    }
  }

  private async executeDefenseAction(action: DefenseAction) {
    switch (action.actionType) {
      case 'emergency_call':
      case 'voice_call':
        await this.makeVoiceCall(action);
        break;
      
      case 'intervention':
        this.showInterventionModal(action);
        break;
      
      case 'notification':
        this.showNotification(action);
        break;
    }
  }

  private async makeVoiceCall(action: DefenseAction) {
    if (!this.voiceSettings?.enableCalls) return;
    
    let message = action.message;
    
    // Use custom prompts if available
    if (this.voiceSettings.selectedCharacter === 'custom' && 
        this.voiceSettings.customPrompts.length > 0) {
      const customPrompts = this.voiceSettings.customPrompts;
      message = customPrompts[Math.floor(Math.random() * customPrompts.length)];
    }
    
    // Add character-specific styling
    message = this.styleMessageForCharacter(message, this.voiceSettings.selectedCharacter);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Configure voice based on settings
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => 
        voice.lang.includes(this.voiceSettings!.selectedVoice.split('-')[0])
      );
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Adjust speech parameters based on severity
      utterance.rate = action.severity === 'critical' ? 1.2 : 1.0;
      utterance.pitch = action.severity === 'critical' ? 1.2 : 1.0;
      utterance.volume = action.severity === 'critical' ? 1.0 : 0.8;
      
      speechSynthesis.speak(utterance);
    }
    
    // Show visual notification as well
    this.showNotification(action);
  }

  private styleMessageForCharacter(message: string, character: string): string {
    switch (character) {
      case 'mom':
        return `Honey, ${message.toLowerCase()} I'm not angry, just disappointed. You know you can do better than this.`;
      
      case 'coach':
        return `LISTEN UP CHAMPION! ${message.toUpperCase()} NO EXCUSES! WINNERS DON'T PROCRASTINATE!`;
      
      case 'custom':
        return message; // Custom messages are already personalized
      
      default:
        return `Hey there! ${message} Remember, I'm your last line of defense against procrastination!`;
    }
  }

  private showInterventionModal(action: DefenseAction) {
    // Create and show intervention modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="text-center mb-6">
          <div class="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
            <svg class="h-10 w-10 text-orange-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            TaskDefender Intervention
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            ${action.message}
          </p>
        </div>
        <div class="space-y-3">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200">
            I'll work on it now!
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
            Remind me in 10 minutes
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 30000);
  }

  private showNotification(action: DefenseAction) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('TaskDefender Alert', {
        body: action.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `taskdefender-${action.taskId}`,
        requireInteraction: action.severity === 'critical'
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  private logDefenseAction(action: DefenseAction) {
    const history = this.getDefenseHistory();
    history.push(action);
    
    // Keep only last 100 actions
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem('taskdefender_defense_history', JSON.stringify(history));
  }

  private getDefenseHistory(): DefenseAction[] {
    const saved = localStorage.getItem('taskdefender_defense_history');
    if (!saved) return [];
    
    try {
      return JSON.parse(saved).map((action: any) => ({
        ...action,
        triggeredAt: new Date(action.triggeredAt)
      }));
    } catch (error) {
      console.error('Failed to load defense history:', error);
      return [];
    }
  }

  // Public methods for manual defense actions
  public triggerManualDefense(taskId: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const tasks = this.getActiveTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      const action = this.createDefenseAction(task, severity);
      this.executeDefenseAction(action);
      this.logDefenseAction(action);
    }
  }

  public getDefenseStats() {
    const history = this.getDefenseHistory();
    const last30Days = history.filter(action => 
      action.triggeredAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    return {
      totalActions: history.length,
      last30Days: last30Days.length,
      successRate: this.calculateSuccessRate(history),
      mostCommonSeverity: this.getMostCommonSeverity(last30Days)
    };
  }

  private calculateSuccessRate(history: DefenseAction[]): number {
    const successfulActions = history.filter(action => action.successful === true);
    return history.length > 0 ? (successfulActions.length / history.length) * 100 : 0;
  }

  private getMostCommonSeverity(history: DefenseAction[]): string {
    const severityCounts = history.reduce((acc, action) => {
      acc[action.severity] = (acc[action.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(severityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'medium';
  }

  public destroy() {
    if (this.defenseTimer) {
      clearInterval(this.defenseTimer);
      this.defenseTimer = null;
    }
  }
}

// Initialize the defense service
export const taskDefenseService = TaskDefenseService.getInstance();