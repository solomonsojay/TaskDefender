import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  X,
  Play,
  Pause,
  Volume2,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScheduledNotification } from '../../types';
import { reminderToneService } from '../../services/ReminderToneService';
import { enhancedSchedulerService } from '../../services/EnhancedSchedulerService';

const NotificationScheduler: React.FC = () => {
  const { tasks, user } = useApp();
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'reminder' as const,
    scheduledFor: '',
    recurring: 'none' as const,
    character: 'default',
    taskId: '',
    voiceEnabled: true,
    toneEnabled: false,
    selectedTone: 'gentle-bell',
    interval: 30,
    snoozeOptions: [5, 10, 15]
  });
  const [selectedToneForTest, setSelectedToneForTest] = useState('gentle-bell');

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem('taskdefender_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved).map((n: any) => ({
            ...n,
            scheduledFor: new Date(n.scheduledFor),
            lastTriggered: n.lastTriggered ? new Date(n.lastTriggered) : undefined,
            snoozedUntil: n.snoozedUntil ? new Date(n.snoozedUntil) : undefined,
            snoozeOptions: n.snoozeOptions || [5, 10, 15]
          }));
          setNotifications(parsed);
        } catch (error) {
          console.error('Failed to load notifications:', error);
        }
      }
    };

    loadNotifications();

    // Set up a refresh interval to update notification status
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('taskdefender_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleCreate = () => {
    if (!newNotification.title || !newNotification.scheduledFor) return;

    const notification: ScheduledNotification = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message || newNotification.title,
      type: newNotification.type,
      scheduledFor: new Date(newNotification.scheduledFor),
      recurring: newNotification.recurring,
      isActive: true,
      character: newNotification.character,
      taskId: newNotification.taskId || undefined,
      voiceEnabled: newNotification.voiceEnabled,
      toneEnabled: newNotification.toneEnabled,
      selectedTone: newNotification.selectedTone,
      interval: newNotification.interval,
      snoozeOptions: newNotification.snoozeOptions,
      reminderCount: 0
    };

    setNotifications(prev => [...prev, notification]);
    setNewNotification({
      title: '',
      message: '',
      type: 'reminder',
      scheduledFor: '',
      recurring: 'none',
      character: 'default',
      taskId: '',
      voiceEnabled: true,
      toneEnabled: false,
      selectedTone: 'gentle-bell',
      interval: 30,
      snoozeOptions: [5, 10, 15]
    });
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleToggle = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isActive: !n.isActive } : n
    ));
  };

  const testTone = () => {
    reminderToneService.testTone(selectedToneForTest);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'nudge': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'deadline': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'celebration': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'defense': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'emergency': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatRecurring = (recurring: string) => {
    switch (recurring) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'workdays': return 'Workdays';
      default: return 'One-time';
    }
  };

  const isOverdue = (notification: ScheduledNotification) => {
    return notification.scheduledFor < new Date() && !notification.lastTriggered;
  };

  const isSnoozed = (notification: ScheduledNotification) => {
    return notification.snoozedUntil && notification.snoozedUntil > new Date();
  };

  const getNotificationStatus = (notification: ScheduledNotification) => {
    if (!notification.isActive) return 'Inactive';
    if (isSnoozed(notification)) return `Snoozed until ${notification.snoozedUntil?.toLocaleTimeString()}`;
    if (isOverdue(notification)) return 'Overdue';
    if (notification.lastTriggered) return `Last triggered: ${notification.lastTriggered.toLocaleTimeString()}`;
    return 'Scheduled';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <Bell className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Scheduler
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule personalized reminders and notifications
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule</span>
        </button>
      </div>

      {/* Tone Testing Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Volume2 className="h-5 w-5 text-blue-500" />
          <span>Test Reminder Tones</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Tone
            </label>
            <select
              value={selectedToneForTest}
              onChange={(e) => setSelectedToneForTest(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              {reminderToneService.getAvailableTones().map(tone => (
                <option key={tone.id} value={tone.id}>
                  {tone.name} - {tone.description}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={testTone}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
            >
              <Volume2 className="h-4 w-4" />
              <span>Test Tone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Schedule New Notification
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Notification title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={newNotification.type}
                onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="reminder">Reminder</option>
                <option value="nudge">Motivational Nudge</option>
                <option value="deadline">Deadline Alert</option>
                <option value="celebration">Celebration</option>
                <option value="defense">Defense Alert</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                rows={3}
                placeholder="Notification message (optional - will use title if empty)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Schedule For
              </label>
              <input
                type="datetime-local"
                value={newNotification.scheduledFor}
                onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledFor: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recurring
              </label>
              <select
                value={newNotification.recurring}
                onChange={(e) => setNewNotification(prev => ({ ...prev, recurring: e.target.value as any }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="workdays">Workdays Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Character
              </label>
              <select
                value={newNotification.character}
                onChange={(e) => setNewNotification(prev => ({ ...prev, character: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="default">TaskDefender AI</option>
                <option value="mom">Concerned Mom</option>
                <option value="coach">Motivational Coach</option>
                <option value="custom">Custom Assistant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Task (Optional)
              </label>
              <select
                value={newNotification.taskId}
                onChange={(e) => setNewNotification(prev => ({ ...prev, taskId: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">No specific task</option>
                {tasks.filter(t => t.status !== 'done').map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminder Interval (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={newNotification.interval}
                onChange={(e) => setNewNotification(prev => ({ ...prev, interval: parseInt(e.target.value) || 30 }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNotification.voiceEnabled}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Voice notification
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNotification.toneEnabled}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, toneEnabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tone notification
                </span>
              </label>
            </div>

            {newNotification.toneEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Tone
                </label>
                <select
                  value={newNotification.selectedTone}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, selectedTone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  {reminderToneService.getAvailableTones().map(tone => (
                    <option key={tone.id} value={tone.id}>
                      {tone.name} - {tone.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Snooze Options (minutes)
              </label>
              <div className="flex space-x-2">
                {[5, 10, 15, 30, 60].map(minutes => (
                  <label key={minutes} className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newNotification.snoozeOptions.includes(minutes)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewNotification(prev => ({
                            ...prev,
                            snoozeOptions: [...prev.snoozeOptions, minutes].sort((a, b) => a - b)
                          }));
                        } else {
                          setNewNotification(prev => ({
                            ...prev,
                            snoozeOptions: prev.snoozeOptions.filter(m => m !== minutes)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{minutes}m</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newNotification.title || !newNotification.scheduledFor}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Scheduled Notifications
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first notification to stay on track
            </p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 ${
              !notification.isActive ? 'opacity-60' : 
              isSnoozed(notification) ? 'border-yellow-300 dark:border-yellow-600' :
              isOverdue(notification) ? 'border-red-300 dark:border-red-600' : ''
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    {!notification.isActive && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        Inactive
                      </span>
                    )}
                    {isSnoozed(notification) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                        Snoozed
                      </span>
                    )}
                    {isOverdue(notification) && notification.isActive && !isSnoozed(notification) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        Overdue
                      </span>
                    )}
                  </div>
                  
                  {notification.message && notification.message !== notification.title && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {notification.message}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{notification.scheduledFor.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatRecurring(notification.recurring)}</span>
                    </div>
                    <span className="capitalize">{notification.character}</span>
                    {notification.voiceEnabled && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                        Voice
                      </span>
                    )}
                    {notification.toneEnabled && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                        Tone
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                      {getNotificationStatus(notification)}
                    </span>
                  </div>

                  {notification.taskId && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Task: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tasks.find(t => t.id === notification.taskId)?.title || 'Unknown Task'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(notification.id)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      notification.isActive
                        ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                    title={notification.isActive ? 'Pause' : 'Resume'}
                  >
                    {notification.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 transition-colors duration-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scheduler Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Enhanced Scheduler Features</span>
        </h4>
        <ul className="space-y-2 text-blue-600 dark:text-blue-300">
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Continuous reminders will sound every minute until you respond</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Snooze options let you delay reminders for 5, 10, or 15 minutes</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Choose between voice reminders or notification tones</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Task-specific reminders can be set from the task list</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>All user interactions with reminders are tracked in analytics</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationScheduler;