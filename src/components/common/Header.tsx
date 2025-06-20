import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Settings, 
  User, 
  Users,
  Menu,
  X,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Logo from './Logo';
import SettingsModal from '../settings/SettingsModal';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: 'dashboard' | 'tasks' | 'focus' | 'teams' | 'analytics' | 'achievements' | 'scheduler') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { user, theme, setTheme } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleTeamsClick = () => {
    setCurrentView('teams');
    setIsMenuOpen(false);
  };

  const handleAnalyticsClick = () => {
    setCurrentView('analytics');
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    setCurrentView('dashboard');
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Clickable */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="bg-orange-500/20 p-2 rounded-lg shadow-lg">
                <Logo size="sm" className="text-orange-500" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  TaskDefender
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your Last Line of Defense Against Procrastination
                </p>
              </div>
            </button>

            {/* Main Navigation - Always visible on larger screens */}
            <div className="flex items-center space-x-3">
              {user && (
                <>
                  {/* Integrity Score - Always visible on sm+ */}
                  <div className="hidden sm:flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Integrity: {user.integrityScore}%
                    </span>
                  </div>
                  
                  {/* Analytics & Streak - Always visible on sm+ */}
                  <button
                    onClick={handleAnalyticsClick}
                    className="hidden sm:flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200"
                    title="View Analytics"
                  >
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      🔥 {user.streak} day streak
                    </span>
                  </button>

                  {/* Teams Button for Admin - Always visible on md+ */}
                  {user.role === 'admin' && (
                    <button 
                      onClick={handleTeamsClick}
                      className={`hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        currentView === 'teams'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title="Team Management"
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Teams</span>
                    </button>
                  )}
                </>
              )}

              {/* Theme Toggle - Always visible */}
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

              {/* Settings Button - Always visible when user exists */}
              {user && (
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}

              {/* User Profile Picture & Info - Always visible on lg+ */}
              {user && (
                <div className="hidden lg:flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-500/20 flex items-center justify-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-orange-500">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button - Only visible on small screens */}
              <div className="lg:hidden">
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
          </div>

          {/* Mobile Menu - Only for small screens */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {user && (
                  <>
                    {/* User Info with Profile Picture - Mobile only */}
                    <div className="flex items-center space-x-3 py-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-500/20 flex items-center justify-center">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-orange-500">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                      </div>
                    </div>

                    {/* Stats - Mobile only */}
                    <div className="grid grid-cols-2 gap-3 py-2">
                      <div className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            {user.integrityScore}% Integrity
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                            🔥 {user.streak} days
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Teams for Admin - Mobile only */}
                    {user.role === 'admin' && (
                      <button
                        onClick={handleTeamsClick}
                        className="flex items-center justify-between w-full py-2"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400">Team Management</span>
                        <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                  </>
                )}
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