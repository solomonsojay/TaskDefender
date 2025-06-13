import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'nudge' | 'deadline' | 'celebration';
  scheduledFor: Date;
  recurring: 'none' | 'daily' | 'weekly' | 'workdays';
  isActive: boolean;
  taskId?: string;
  persona: string;
}

const NotificationScheduler: React.FC = () => {
  const { tasks } = useApp();
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'reminder' as const,
    scheduledFor: '',
    recurring: 'none' as const,
    persona: 'default',
    taskId: ''
  });

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskdefender_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((n: any) => ({
          ...n,
          scheduledFor: new Date(n.scheduledFor)
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('taskdefender_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Check for due notifications
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      notifications.forEach(notification => {
        if (notification.isActive && notification.scheduledFor <= now) {
          // Trigger notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico'
            });
          }
          
          // Handle recurring notifications
          if (notification.recurring !== 'none') {
            const nextDate = new Date(notification.scheduledFor);
            switch (notification.recurring) {
              case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
              case 'workdays':
                do {
                  nextDate.setDate(nextDate.getDate() + 1);
                } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
                break;
            }
            
            setNotifications(prev => prev.map(n => 
              n.id === notification.id 
                ? { ...n, scheduledFor: nextDate }
                : n
            ));
          } else {
            // Remove one-time notifications after triggering
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
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
      persona: newNotification.persona,
      taskId: newNotification.taskId || undefined
    };

    setNotifications(prev => [...prev, notification]);
    setNewNotification({
      title: '',
      message: '',
      type: 'reminder',
      scheduledFor: '',
      recurring: 'none',
      persona: 'default',
      taskId: ''
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'nudge': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'deadline': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'celebration': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
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
              Smart Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule personalized reminders and nudges
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

      {/* Create/Edit Form */}
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
                Persona
              </label>
              <select
                value={newNotification.persona}
                onChange={(e) => setNewNotification(prev => ({ ...prev, persona: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="default">Default</option>
                <option value="gordon">Gordon Ramsay</option>
                <option value="mom">Mom</option>
                <option value="hr">Corporate HR</option>
                <option value="passive-aggressive">Passive Aggressive</option>
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
              Create your first smart notification to stay on track
            </p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 ${
              !notification.isActive ? 'opacity-60' : ''
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
                        Paused
                      </span>
                    )}
                  </div>
                  
                  {notification.message && notification.message !== notification.title && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {notification.message}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{notification.scheduledFor.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatRecurring(notification.recurring)}</span>
                    </div>
                    <span className="capitalize">{notification.persona}</span>
                  </div>
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
                    <Bell className="h-4 w-4" />
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
    </div>
  );
};

export default NotificationScheduler;