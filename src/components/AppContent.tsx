import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useSarcasticPrompts } from '../hooks/useSarcasticPrompts';
import Header from './common/Header';
import Dashboard from './dashboard/Dashboard';
import TaskList from './tasks/TaskList';
import QuickTaskCapture from './tasks/QuickTaskCapture';
import FocusMode from './focus/FocusMode';
import TeamManagement from './teams/TeamManagement';
import UserAnalytics from './analytics/UserAnalytics';
import SarcasticPromptDisplay from './sarcasm/SarcasticPromptDisplay';
import ChatBot from './chatbot/ChatBot';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'tasks' | 'focus' | 'teams' | 'analytics'>('dashboard');
  const [isChatBotOpen, setIsChatBotOpen] = React.useState(false);
  
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
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'focus', label: 'Focus Mode' },
              { id: 'analytics', label: 'Analytics' },
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
          {currentView === 'teams' && <TeamManagement />}
          {currentView === 'analytics' && <UserAnalytics />}
        </main>
      </div>

      {/* Sarcastic Prompt Overlay */}
      <SarcasticPromptDisplay
        prompt={currentPrompt}
        onDismiss={dismissPrompt}
        onPersonaChange={changePersona}
        currentPersona={userPersona}
      />

      {/* ChatBot */}
      <ChatBot 
        isOpen={isChatBotOpen} 
        onToggle={() => setIsChatBotOpen(!isChatBotOpen)} 
      />
    </div>
  );
};

export default AppContent;