import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import FocusMode from './components/FocusMode';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'focus'>('dashboard');

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'tasks', label: 'Tasks' },
                { id: 'focus', label: 'Focus Mode' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;