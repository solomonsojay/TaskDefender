import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { useSarcasticPrompts } from './hooks/useSarcasticPrompts';
import Header from './components/common/Header';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/dashboard/Dashboard';
import TaskList from './components/tasks/TaskList';
import FocusMode from './components/focus/FocusMode';
import TeamManagement from './components/teams/TeamManagement';
import Settings from './components/settings/Settings';
import NotificationScheduler from './components/notifications/NotificationScheduler';
import VoiceCallSystem from './components/voice/VoiceCallSystem';
import SarcasticPromptDisplay from './components/sarcasm/SarcasticPromptDisplay';

const AppContent: React.FC = () => {
  const { user, isOnboarding } = useApp();
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'tasks' | 'focus' | 'teams' | 'settings' | 'notifications' | 'voice'>('dashboard');
  
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

  if (isOnboarding || !user) {
    return <OnboardingFlow />;
  }

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
              { id: 'notifications', label: 'Notifications' },
              { id: 'voice', label: 'Voice Calls' },
              ...(user.role === 'admin' ? [{ id: 'teams', label: 'Teams' }] : []),
              { id: 'settings', label: 'Settings' },
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
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'tasks' && <TaskList />}
          {currentView === 'focus' && <FocusMode />}
          {currentView === 'notifications' && <NotificationScheduler />}
          {currentView === 'voice' && <VoiceCallSystem />}
          {currentView === 'teams' && user.role === 'admin' && <TeamManagement />}
          {currentView === 'settings' && <Settings />}
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

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;