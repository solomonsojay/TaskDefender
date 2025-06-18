import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useSarcasticPrompts } from '../hooks/useSarcasticPrompts';
import Header from './common/Header';
import Dashboard from './dashboard/Dashboard';
import TaskList from './tasks/TaskList';
import QuickTaskCapture from './tasks/QuickTaskCapture';
import FocusMode from './focus/FocusMode';
import TeamManagement from './teams/TeamManagement';
import VoiceCallSystem from './voice/VoiceCallSystem';
import NotificationScheduler from './notifications/NotificationScheduler';
import MonitoringDashboard from './monitoring/MonitoringDashboard';
import SmartInterventionSystem from './ai/SmartInterventionSystem';
import SarcasticPromptDisplay from './sarcasm/SarcasticPromptDisplay';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'tasks' | 'focus' | 'teams' | 'notifications' | 'voice' | 'monitoring' | 'ai-interventions'>('dashboard');
  
  const {
    currentPrompt,
    userPersona,
    updateActivity,
    dismissPrompt,
    changePersona
  } = useSarcasticPrompts();

  // Track user activity for sarcastic prompts
  React.useEffect(() => {
    const handleActivity = () => updateActivity();
    
    // Listen for various user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'focus', label: 'Focus Mode' },
              { id: 'monitoring', label: 'Advanced Monitoring' },
              { id: 'ai-interventions', label: 'AI Interventions' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'voice', label: 'Voice Calls' },
              ...(user?.role === 'admin' ? [{ id: 'teams', label: 'Teams' }] : []),
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main>
          {currentView === 'dashboard' && (
            <div className="space-y-8">
              <QuickTaskCapture />
              <Dashboard />
            </div>
          )}
          {currentView === 'tasks' && <TaskList />}
          {currentView === 'focus' && <FocusMode />}
          {currentView === 'monitoring' && <MonitoringDashboard />}
          {currentView === 'ai-interventions' && <SmartInterventionSystem />}
          {currentView === 'teams' && user?.role === 'admin' && <TeamManagement />}
          {currentView === 'voice' && <VoiceCallSystem />}
          {currentView === 'notifications' && <NotificationScheduler />}
        </main>
      </div>

      {/* Sarcastic Prompt Overlay */}
      <SarcasticPromptDisplay
        prompt={currentPrompt}
        onDismiss={dismissPrompt}
        onPersonaChange={changePersona}
        currentPersona={userPersona}
      />
    </div>
  );
};

export default AppContent;