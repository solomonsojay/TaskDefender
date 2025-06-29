import { ScheduledNotification, TaskReminderSettings } from '../types';
import { generateSecureId } from '../utils/validation';
import { reminderToneService } from './ReminderToneService';

export class EnhancedSchedulerService {
  private static instance: EnhancedSchedulerService;
  private activeReminders: Map<string, number> = new Map();
  private reminderIntervals: Map<string, number> = new Map();

  private constructor() {
    this.startReminderMonitoring();
  }

  static getInstance(): EnhancedSchedulerService {
    if (!EnhancedSchedulerService.instance) {
      EnhancedSchedulerService.instance = new EnhancedSchedulerService();
    }
    return EnhancedSchedulerService.instance;
  }

  private startReminderMonitoring() {
    // Check every 30 seconds for due reminders
    setInterval(() => {
      this.checkDueReminders();
    }, 30000);
  }

  private checkDueReminders() {
    try {
      const notifications = this.getActiveNotifications();
      const now = new Date();

      notifications.forEach(notification => {
        if (this.isReminderDue(notification, now)) {
          this.triggerReminder(notification);
        }
      });
    } catch (error) {
      console.error('Error checking due reminders:', error);
    }
  }

  private isReminderDue(notification: ScheduledNotification, now: Date): boolean {
    // Check if snoozed
    if (notification.snoozedUntil && notification.snoozedUntil > now) {
      return false;
    }

    // Check if it's time for the reminder
    if (notification.scheduledFor <= now) {
      // If it's a recurring reminder, check if enough time has passed since last trigger
      if (notification.lastTriggered) {
        const timeSinceLastTrigger = now.getTime() - notification.lastTriggered.getTime();
        const intervalMs = notification.interval * 60 * 1000; // Convert minutes to ms
        return timeSinceLastTrigger >= intervalMs;
      }
      return true;
    }

    return false;
  }

  private async triggerReminder(notification: ScheduledNotification) {
    try {
      console.log('🔔 Triggering reminder:', notification.title);

      // Update last triggered time
      notification.lastTriggered = new Date();
      notification.reminderCount = (notification.reminderCount || 0) + 1;
      this.saveNotification(notification);

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
          requireInteraction: true
        });

        browserNotification.onclick = () => {
          window.focus();
          this.showReminderModal(notification);
          browserNotification.close();
        };
      }

      // Play voice or tone
      if (notification.voiceEnabled && notification.character) {
        await this.playVoiceReminder(notification);
      } else if (notification.toneEnabled && notification.selectedTone) {
        await reminderToneService.playTone(notification.selectedTone);
      }

      // Show modal for important reminders
      this.showReminderModal(notification);

      // Start continuous reminders every 1 minute until user responds
      this.startContinuousReminder(notification);

    } catch (error) {
      console.error('Error triggering reminder:', error);
    }
  }

  private async playVoiceReminder(notification: ScheduledNotification) {
    if (!('speechSynthesis' in window)) return;

    try {
      const utterance = new SpeechSynthesisUtterance(notification.message);
      
      // Character-specific voice settings
      switch (notification.character) {
        case 'mom':
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          break;
        case 'coach':
          utterance.rate = 1.2;
          utterance.pitch = 0.9;
          utterance.volume = 1.0;
          break;
        default:
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
      }

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error playing voice reminder:', error);
    }
  }

  private showReminderModal(notification: ScheduledNotification) {
    try {
      // Remove any existing reminder modal
      const existingModal = document.getElementById(`reminder-modal-${notification.id}`);
      if (existingModal) {
        existingModal.remove();
      }

      const modal = document.createElement('div');
      modal.id = `reminder-modal-${notification.id}`;
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
      
      const urgencyClass = notification.type === 'emergency' ? 'border-red-500 bg-red-50' : 
                          notification.type === 'deadline' ? 'border-orange-500 bg-orange-50' : 
                          'border-blue-500 bg-blue-50';

      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 ${urgencyClass} dark:border-opacity-50">
          <div class="text-center mb-6">
            <div class="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
              <svg class="h-10 w-10 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ${notification.title}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              ${notification.message}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Reminder #${notification.reminderCount || 1}
            </p>
          </div>
          
          <div class="space-y-3">
            <button onclick="window.enhancedSchedulerService.acknowledgeReminder('${notification.id}')" 
                    class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200">
              ✅ Got it! I'll handle this now
            </button>
            
            <div class="grid grid-cols-3 gap-2">
              ${notification.snoozeOptions.map(minutes => `
                <button onclick="window.enhancedSchedulerService.snoozeReminder('${notification.id}', ${minutes})" 
                        class="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 py-2 px-3 rounded-lg font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-all duration-200 text-sm">
                  ${minutes}m
                </button>
              `).join('')}
            </div>
            
            <button onclick="window.enhancedSchedulerService.dismissReminder('${notification.id}')" 
                    class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
              Dismiss
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Auto-dismiss after 2 minutes if no response
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 120000);

    } catch (error) {
      console.error('Error showing reminder modal:', error);
    }
  }

  private startContinuousReminder(notification: ScheduledNotification) {
    // Clear any existing continuous reminder
    this.stopContinuousReminder(notification.id);

    // Start new continuous reminder every 1 minute
    const intervalId = window.setInterval(() => {
      const now = new Date();
      
      // Stop if snoozed or dismissed
      if (notification.snoozedUntil && notification.snoozedUntil > now) {
        this.stopContinuousReminder(notification.id);
        return;
      }

      // Play tone or voice reminder
      if (notification.toneEnabled && notification.selectedTone) {
        reminderToneService.playTone(notification.selectedTone, 0.3);
      } else if (notification.voiceEnabled) {
        this.playVoiceReminder(notification);
      }

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${notification.title} (Reminder #${(notification.reminderCount || 0) + 1})`, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: `${notification.id}-continuous`
        });
      }

      notification.reminderCount = (notification.reminderCount || 0) + 1;
      this.saveNotification(notification);

    }, 60000); // Every 1 minute

    this.reminderIntervals.set(notification.id, intervalId);
  }

  private stopContinuousReminder(notificationId: string) {
    const intervalId = this.reminderIntervals.get(notificationId);
    if (intervalId) {
      clearInterval(intervalId);
      this.reminderIntervals.delete(notificationId);
    }
  }

  acknowledgeReminder(notificationId: string) {
    try {
      this.stopContinuousReminder(notificationId);
      this.removeReminderModal(notificationId);
      
      const notification = this.getNotification(notificationId);
      if (notification) {
        notification.snoozedUntil = undefined;
        notification.reminderCount = 0;
        this.saveNotification(notification);
      }

      console.log('✅ Reminder acknowledged:', notificationId);
    } catch (error) {
      console.error('Error acknowledging reminder:', error);
    }
  }

  snoozeReminder(notificationId: string, minutes: number) {
    try {
      this.stopContinuousReminder(notificationId);
      this.removeReminderModal(notificationId);
      
      const notification = this.getNotification(notificationId);
      if (notification) {
        notification.snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);
        notification.reminderCount = 0;
        this.saveNotification(notification);
      }

      console.log(`⏰ Reminder snoozed for ${minutes} minutes:`, notificationId);
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  }

  dismissReminder(notificationId: string) {
    try {
      this.stopContinuousReminder(notificationId);
      this.removeReminderModal(notificationId);
      
      const notification = this.getNotification(notificationId);
      if (notification) {
        notification.isActive = false;
        notification.reminderCount = 0;
        this.saveNotification(notification);
      }

      console.log('❌ Reminder dismissed:', notificationId);
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  }

  private removeReminderModal(notificationId: string) {
    const modal = document.getElementById(`reminder-modal-${notificationId}`);
    if (modal) {
      modal.remove();
    }
  }

  private getActiveNotifications(): ScheduledNotification[] {
    try {
      const saved = localStorage.getItem('taskdefender_notifications');
      if (!saved) return [];

      return JSON.parse(saved)
        .filter((n: any) => n.isActive)
        .map((n: any) => ({
          ...n,
          scheduledFor: new Date(n.scheduledFor),
          lastTriggered: n.lastTriggered ? new Date(n.lastTriggered) : undefined,
          snoozedUntil: n.snoozedUntil ? new Date(n.snoozedUntil) : undefined
        }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return [];
    }
  }

  private getNotification(id: string): ScheduledNotification | null {
    const notifications = this.getActiveNotifications();
    return notifications.find(n => n.id === id) || null;
  }

  private saveNotification(notification: ScheduledNotification) {
    try {
      const saved = localStorage.getItem('taskdefender_notifications');
      const notifications = saved ? JSON.parse(saved) : [];
      
      const index = notifications.findIndex((n: any) => n.id === notification.id);
      if (index >= 0) {
        notifications[index] = notification;
      } else {
        notifications.push(notification);
      }

      localStorage.setItem('taskdefender_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  }

  // Task-specific reminder methods
  setTaskReminder(taskId: string, settings: TaskReminderSettings) {
    try {
      const notification: ScheduledNotification = {
        id: generateSecureId(),
        title: `Task Reminder`,
        message: `Time to work on your task!`,
        type: 'reminder',
        scheduledFor: new Date(Date.now() + settings.interval * 60 * 1000),
        recurring: 'none',
        isActive: settings.enabled,
        taskId,
        character: settings.character || 'default',
        voiceEnabled: settings.useVoice,
        toneEnabled: settings.useTone,
        selectedTone: settings.selectedTone,
        interval: settings.interval,
        snoozeOptions: settings.snoozeOptions,
        reminderCount: 0
      };

      this.saveNotification(notification);
      console.log('📅 Task reminder set:', taskId, settings.interval, 'minutes');
    } catch (error) {
      console.error('Error setting task reminder:', error);
    }
  }

  clearTaskReminders(taskId: string) {
    try {
      const saved = localStorage.getItem('taskdefender_notifications');
      if (!saved) return;

      const notifications = JSON.parse(saved);
      const filtered = notifications.filter((n: any) => n.taskId !== taskId);
      
      localStorage.setItem('taskdefender_notifications', JSON.stringify(filtered));
      
      // Stop any active continuous reminders for this task
      notifications
        .filter((n: any) => n.taskId === taskId)
        .forEach((n: any) => this.stopContinuousReminder(n.id));

      console.log('🗑️ Task reminders cleared:', taskId);
    } catch (error) {
      console.error('Error clearing task reminders:', error);
    }
  }
}

// Make service available globally for modal buttons
(window as any).enhancedSchedulerService = EnhancedSchedulerService.getInstance();

export const enhancedSchedulerService = EnhancedSchedulerService.getInstance();