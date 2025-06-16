import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Play,
  Pause
} from 'lucide-react';
import { enhancedAIAnalyzer, ContextualState } from '../../services/EnhancedAIAnalyzer';
import { useSarcasticPrompts } from '../../hooks/useSarcasticPrompts';
import { useApp } from '../../contexts/AppContext';

interface InterventionSettings {
  enableSmartNudging: boolean;
  adaptiveFrequency: boolean;
  contextAwareness: boolean;
  emergencyMode: boolean;
  positiveReinforcement: boolean;
  interventionThreshold: number; // 0-100
  quietHours: { start: string; end: string };
}

const SmartInterventionSystem: React.FC = () => {
  const { tasks } = useApp();
  const { generateNudge, celebrateCompletion } = useSarcasticPrompts();
  const [isActive, setIsActive] = useState(false);
  const [currentContext, setCurrentContext] = useState<ContextualState | null>(null);
  const [settings, setSettings] = useState<InterventionSettings>({
    enableSmartNudging: true,
    adaptiveFrequency: true,
    contextAwareness: true,
    emergencyMode: true,
    positiveReinforcement: true,
    interventionThreshold: 60,
    quietHours: { start: '22:00', end: '08:00' }
  });
  const [interventionHistory, setInterventionHistory] = useState<Array<{
    timestamp: Date;
    type: string;
    effectiveness: number;
    context: string;
  }>>([]);

  useEffect(() => {
    loadSettings();
    if (isActive) {
      startSmartInterventions();
    }
    return () => stopSmartInterventions();
  }, [isActive]);

  useEffect(() => {
    const updateContext = async () => {
      if (isActive) {
        const context = await enhancedAIAnalyzer.getCurrentContext();
        setCurrentContext(context);
      }
    };

    const interval = setInterval(updateContext, 60000); // Update every minute
    updateContext(); // Initial update

    return () => clearInterval(interval);
  }, [isActive]);

  const loadSettings = () => {
    const saved = localStorage.getItem('taskdefender_intervention_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load intervention settings:', error);
      }
    }
  };

  const saveSettings = (newSettings: InterventionSettings) => {
    setSettings(newSettings);
    localStorage.setItem('taskdefender_intervention_settings', JSON.stringify(newSettings));
  };

  const startSmartInterventions = () => {
    console.log('🧠 Smart Intervention System activated');
    
    // Set up intervention checking
    const checkInterval = setInterval(() => {
      if (shouldIntervene()) {
        executeIntervention();
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    return () => clearInterval(checkInterval);
  };

  const stopSmartInterventions = () => {
    console.log('⏹️ Smart Intervention System deactivated');
  };

  const shouldIntervene = (): boolean => {
    if (!currentContext || !settings.enableSmartNudging) return false;

    // Check quiet hours
    if (isQuietHours()) return false;

    // Check intervention threshold
    const interventionScore = calculateInterventionScore();
    return interventionScore >= settings.interventionThreshold;
  };

  const isQuietHours = (): boolean => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime > endTime) {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  };

  const calculateInterventionScore = (): number => {
    if (!currentContext) return 0;

    let score = 0;

    // Factor 1: Low focus level
    if (currentContext.focusLevel < 40) score += 30;
    else if (currentContext.focusLevel < 60) score += 15;

    // Factor 2: High distraction risk
    if (currentContext.distractionRisk > 70) score += 25;
    else if (currentContext.distractionRisk > 50) score += 15;

    // Factor 3: Low energy level
    if (currentContext.energyLevel < 30) score += 20;
    else if (currentContext.energyLevel < 50) score += 10;

    // Factor 4: Overdue break
    if (currentContext.recommendedBreakIn <= 0) score += 15;

    // Factor 5: Current activity
    if (currentContext.currentActivity === 'distracting') score += 20;
    else if (currentContext.currentActivity === 'idle') score += 10;

    // Emergency mode for critical tasks
    if (settings.emergencyMode) {
      const criticalTasks = tasks.filter(task => 
        task.status !== 'done' && 
        task.dueDate && 
        new Date(task.dueDate).getTime() - Date.now() < 2 * 60 * 60 * 1000 // 2 hours
      );
      if (criticalTasks.length > 0) score += 40;
    }

    return Math.min(100, score);
  };

  const executeIntervention = () => {
    if (!currentContext) return;

    const interventionType = selectInterventionType();
    
    switch (interventionType) {
      case 'gentle_nudge':
        generateNudge();
        break;
      case 'break_reminder':
        generateBreakReminder();
        break;
      case 'focus_boost':
        generateFocusBoost();
        break;
      case 'emergency_alert':
        generateEmergencyAlert();
        break;
      case 'positive_reinforcement':
        if (settings.positiveReinforcement) {
          celebrateCompletion();
        }
        break;
    }

    // Log intervention
    logIntervention(interventionType);
  };

  const selectInterventionType = (): string => {
    if (!currentContext) return 'gentle_nudge';

    // Emergency mode for critical deadlines
    if (settings.emergencyMode) {
      const criticalTasks = tasks.filter(task => 
        task.status !== 'done' && 
        task.dueDate && 
        new Date(task.dueDate).getTime() - Date.now() < 1 * 60 * 60 * 1000 // 1 hour
      );
      if (criticalTasks.length > 0) return 'emergency_alert';
    }

    // Break reminder
    if (currentContext.recommendedBreakIn <= 0) return 'break_reminder';

    // Focus boost for high distraction
    if (currentContext.distractionRisk > 70) return 'focus_boost';

    // Positive reinforcement for good performance
    if (currentContext.focusLevel > 80 && currentContext.energyLevel > 70) {
      return 'positive_reinforcement';
    }

    // Default gentle nudge
    return 'gentle_nudge';
  };

  const generateBreakReminder = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Break Time! 🧘‍♀️', {
        body: 'You\'ve been working hard. Take a 5-10 minute break to recharge.',
        icon: '/favicon.ico'
      });
    }
  };

  const generateFocusBoost = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Alert! 🎯', {
        body: 'High distraction detected. Close unnecessary tabs and eliminate distractions.',
        icon: '/favicon.ico'
      });
    }
  };

  const generateEmergencyAlert = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('URGENT: Deadline Alert! ⚠️', {
        body: 'Critical deadline approaching! Drop everything and focus on your urgent tasks.',
        icon: '/favicon.ico'
      });
    }
  };

  const logIntervention = (type: string) => {
    const newIntervention = {
      timestamp: new Date(),
      type,
      effectiveness: 0, // Will be updated based on user response
      context: currentContext ? `Focus: ${currentContext.focusLevel}%, Energy: ${currentContext.energyLevel}%` : 'Unknown'
    };

    setInterventionHistory(prev => [newIntervention, ...prev.slice(0, 49)]); // Keep last 50
  };

  const getContextStatusColor = (value: number, reverse: boolean = false) => {
    if (reverse) {
      if (value < 30) return 'text-green-500';
      if (value < 60) return 'text-yellow-500';
      return 'text-red-500';
    } else {
      if (value > 70) return 'text-green-500';
      if (value > 40) return 'text-yellow-500';
      return 'text-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/20 p-3 rounded-xl">
            <Brain className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Smart Intervention System
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered contextual productivity assistance
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            isActive
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isActive ? 'Active' : 'Inactive'}</span>
        </button>
      </div>

      {/* Current Context */}
      {currentContext && isActive && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Context Analysis
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getContextStatusColor(currentContext.focusLevel)} mb-1`}>
                {currentContext.focusLevel}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Focus Level</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getContextStatusColor(currentContext.energyLevel)} mb-1`}>
                {currentContext.energyLevel}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Energy Level</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getContextStatusColor(currentContext.distractionRisk, true)} mb-1`}>
                {currentContext.distractionRisk}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Distraction Risk</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {currentContext.recommendedBreakIn}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Break In</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Activity:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                {currentContext.currentActivity}
              </span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Optimal Task Type:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                {currentContext.optimalTaskType}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Intervention Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Intervention Settings
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'enableSmartNudging', label: 'Smart Nudging', description: 'AI-powered contextual reminders' },
            { key: 'adaptiveFrequency', label: 'Adaptive Frequency', description: 'Learn optimal intervention timing' },
            { key: 'contextAwareness', label: 'Context Awareness', description: 'Consider current activity and state' },
            { key: 'emergencyMode', label: 'Emergency Mode', description: 'Urgent alerts for critical deadlines' },
            { key: 'positiveReinforcement', label: 'Positive Reinforcement', description: 'Celebrate achievements and progress' },
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{setting.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings[setting.key as keyof InterventionSettings] as boolean}
                  onChange={(e) => saveSettings({ ...settings, [setting.key]: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
          ))}
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intervention Threshold: {settings.interventionThreshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.interventionThreshold}
              onChange={(e) => saveSettings({ ...settings, interventionThreshold: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Never</span>
              <span>Moderate</span>
              <span>Aggressive</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quiet Hours Start
              </label>
              <input
                type="time"
                value={settings.quietHours.start}
                onChange={(e) => saveSettings({ 
                  ...settings, 
                  quietHours: { ...settings.quietHours, start: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quiet Hours End
              </label>
              <input
                type="time"
                value={settings.quietHours.end}
                onChange={(e) => saveSettings({ 
                  ...settings, 
                  quietHours: { ...settings.quietHours, end: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Intervention History */}
      {interventionHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Interventions
          </h3>
          
          <div className="space-y-3">
            {interventionHistory.slice(0, 10).map((intervention, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {intervention.type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    {intervention.context}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {intervention.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartInterventionSystem;