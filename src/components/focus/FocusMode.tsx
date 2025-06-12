import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Target,
  Timer,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const FocusMode: React.FC = () => {
  const { focusSession, endFocusSession, tasks } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [distractions, setDistractions] = useState(0);

  const currentTask = focusSession ? tasks.find(t => t.id === focusSession.taskId) : null;

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

  const handleSessionComplete = () => {
    setIsActive(false);
    setCompletedSessions(prev => prev + 1);
    
    if (sessionType === 'work') {
      setSessionType('break');
      setTimeLeft(5 * 60); // 5 minute break
    } else {
      setSessionType('work');
      setTimeLeft(25 * 60); // 25 minute work session
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60);
  };

  const endSession = () => {
    setIsActive(false);
    endFocusSession();
  };

  const reportDistraction = () => {
    setDistractions(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionType === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  if (!focusSession) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-200">
        <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6">
          <Target className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Focus Mode
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select a task and click the focus button to start a focused work session with the Pomodoro technique.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">25</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Minutes Focus</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">5</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Minutes Break</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rounds</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className={`p-3 rounded-full ${sessionType === 'work' ? 'bg-orange-500/20' : 'bg-green-500/20'}`}>
            {sessionType === 'work' ? (
              <Target className={`h-6 w-6 ${sessionType === 'work' ? 'text-orange-500' : 'text-green-500'}`} />
            ) : (
              <Timer className="h-6 w-6 text-green-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {sessionType === 'work' ? 'Focus Time' : 'Break Time'}
          </h2>
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
            className={`transition-all duration-1000 ${
              sessionType === 'work' ? 'text-orange-500' : 'text-green-500'
            }`}
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
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
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
      <div className="grid grid-cols-2 gap-4 mb-6">
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
  );
};

export default FocusMode;