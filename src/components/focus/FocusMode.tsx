import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Target,
  Timer,
  AlertCircle,
  Settings,
  TrendingUp,
  Award
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface FocusSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
}

const FocusMode: React.FC = () => {
  const { focusSession, endFocusSession, tasks } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<FocusSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true
  });

  const currentTask = focusSession ? tasks.find(t => t.id === focusSession.taskId) : null;

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskdefender_focus_settings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        setSettings(savedSettings);
        // Update initial time based on saved settings
        setTimeLeft(savedSettings.workDuration * 60);
      } catch (error) {
        console.error('Failed to load focus settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('taskdefender_focus_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const playNotificationSound = () => {
    if (settings.soundEnabled && 'speechSynthesis' in window) {
      // Use a simple beep sound or text-to-speech
      const utterance = new SpeechSynthesisUtterance('Session complete');
      utterance.volume = 0.3;
      utterance.rate = 1.5;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    playNotificationSound();
    
    if (sessionType === 'work') {
      setCompletedSessions(prev => prev + 1);
      
      // Determine next break type
      const nextSessionCount = completedSessions + 1;
      const isLongBreak = nextSessionCount % settings.sessionsUntilLongBreak === 0;
      
      if (isLongBreak) {
        setSessionType('long-break');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setSessionType('short-break');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
      
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsActive(true), 2000);
      }
    } else {
      setSessionType('work');
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.autoStartWork) {
        setTimeout(() => setIsActive(true), 2000);
      }
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (sessionType === 'work') {
      setTimeLeft(settings.workDuration * 60);
    } else if (sessionType === 'short-break') {
      setTimeLeft(settings.shortBreakDuration * 60);
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
    }
  };

  const endSession = () => {
    setIsActive(false);
    endFocusSession();
    setCompletedSessions(0);
    setDistractions(0);
    setSessionType('work');
    setTimeLeft(settings.workDuration * 60);
  };

  const reportDistraction = () => {
    setDistractions(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDuration = () => {
    switch (sessionType) {
      case 'work': return settings.workDuration * 60;
      case 'short-break': return settings.shortBreakDuration * 60;
      case 'long-break': return settings.longBreakDuration * 60;
      default: return settings.workDuration * 60;
    }
  };

  const progress = ((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100;

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work': return 'text-orange-500';
      case 'short-break': return 'text-green-500';
      case 'long-break': return 'text-blue-500';
      default: return 'text-orange-500';
    }
  };

  const getSessionBgColor = () => {
    switch (sessionType) {
      case 'work': return 'bg-orange-500/20';
      case 'short-break': return 'bg-green-500/20';
      case 'long-break': return 'bg-blue-500/20';
      default: return 'bg-orange-500/20';
    }
  };

  if (!focusSession) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-200">
          <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6">
            <Target className="h-12 w-12 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Enhanced Focus Mode
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a task and click the focus button to start a focused work session with the advanced Pomodoro technique.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-8">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{settings.workDuration}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes Focus</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{settings.shortBreakDuration}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes Break</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{settings.longBreakDuration}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Long Break</div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <Settings className="h-4 w-4" />
            <span>Customize Settings</span>
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Focus Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreakDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 5 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sessions until Long Break
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={settings.sessionsUntilLongBreak}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) || 4 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-start breaks</span>
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-start work</span>
                    <input
                      type="checkbox"
                      checked={settings.autoStartWork}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartWork: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTimeLeft(settings.workDuration * 60);
                    setShowSettings(false);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`p-3 rounded-full ${getSessionBgColor()}`}>
              {sessionType === 'work' ? (
                <Target className={`h-6 w-6 ${getSessionColor()}`} />
              ) : (
                <Timer className={`h-6 w-6 ${getSessionColor()}`} />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessionType === 'work' ? 'Focus Time' : 
               sessionType === 'short-break' ? 'Short Break' : 'Long Break'}
            </h2>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Settings className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {currentTask && sessionType === 'work' && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Current Task:
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{currentTask.title}</p>
            </div>
          )}
        </div>

        {/* Timer Circle */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={`transition-all duration-1000 ${getSessionColor()}`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Session {completedSessions + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={toggleTimer}
            className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : `bg-gradient-to-r ${
                    sessionType === 'work' ? 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' :
                    sessionType === 'short-break' ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' :
                    'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } text-white`
            }`}
          >
            {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
          
          <button
            onClick={endSession}
            className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <Square className="h-6 w-6" />
          </button>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {completedSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
              {distractions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Distractions</div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {Math.floor(completedSessions / settings.sessionsUntilLongBreak)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cycles</div>
          </div>
        </div>

        {/* Progress to Long Break */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress to Long Break
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedSessions % settings.sessionsUntilLongBreak}/{settings.sessionsUntilLongBreak}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((completedSessions % settings.sessionsUntilLongBreak) / settings.sessionsUntilLongBreak) * 100}%` }}
            />
          </div>
        </div>

        {/* Distraction Alert */}
        {sessionType === 'work' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  Stay focused! Avoid distractions.
                </span>
              </div>
              <button
                onClick={reportDistraction}
                className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors duration-200"
              >
                Report Distraction
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Focus Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 5 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sessions until Long Break
                </label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) || 4 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-start breaks</span>
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-start work</span>
                  <input
                    type="checkbox"
                    checked={settings.autoStartWork}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStartWork: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTimeLeft(settings.workDuration * 60);
                  setShowSettings(false);
                }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;