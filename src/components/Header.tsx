import React, { useState } from 'react';
import { Moon, Sun, Settings, User, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import SettingsModal from './settings/SettingsModal';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: any) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { user, theme, setTheme } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleTeamsClick = () => {
    setCurrentView('teams');
  };

  const handleLogoClick = () => {
    setCurrentView('dashboard');
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="bg-orange-500/20 p-2 rounded-lg shadow-lg">
                <Logo size="sm" className="text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  TaskDefender
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your Last Line of Defense
                </p>
              </div>
            </button>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Integrity: {user.integrityScore}%
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      🔥 {user.streak} day streak
                    </span>
                  </div>
                </>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {user && (
                <div className="flex items-center space-x-2">
                  {user.role === 'admin' && (
                    <button 
                      onClick={handleTeamsClick}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        currentView === 'teams'
                          ? 'bg-orange-500 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title="Team Management"
                    >
                      <Users className="h-5 w-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      @{user.username}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Header;