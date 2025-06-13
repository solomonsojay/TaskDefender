import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Settings, 
  User, 
  Users,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Logo from './Logo';
import SettingsModal from '../settings/SettingsModal';

const Header: React.FC = () => {
  const { user, theme, setTheme } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500/20 p-2 rounded-lg shadow-lg">
                <Logo size="sm" className="text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Task Defender
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Defend Your Productivity
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
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
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
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
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                      <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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
                      {user.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {user && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Integrity Score</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {user.integrityScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        🔥 {user.streak} days
                      </span>
                    </div>
                  </>
                )}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full py-2"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                  <div className="flex items-center space-x-2">
                    {theme === 'light' ? (
                      <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                    <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                      {theme}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center justify-between w-full py-2"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">Settings</span>
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Header;