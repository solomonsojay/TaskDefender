import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from './Header';
import Dashboard from './Dashboard';
import TaskList from './TaskList';
import FocusMode from './FocusMode';
import TeamManagement from './teams/TeamManagement';
import Analytics from './analytics/Analytics';
import VoiceCallSystem from './voice/VoiceCallSystem';
import ChatBot from './chatbot/ChatBot';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'focus' | 'teams' | 'analytics' | 'voice-calls'>('dashboard');
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

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
              { id: 'voice-calls', label: 'Voice Calls' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'teams', label: 'Teams' },
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
          {currentView === 'voice-calls' && <VoiceCallSystem />}
          {currentView === 'analytics' && <Analytics />}
          {currentView === 'teams' && <TeamManagement />}
        </main>
      </div>

      {/* ChatBot */}
      <ChatBot 
        isOpen={isChatBotOpen} 
        onToggle={() => setIsChatBotOpen(!isChatBotOpen)} 
      />
    </div>
  );
};

export default AppContent;