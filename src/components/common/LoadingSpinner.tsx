import React from 'react';
import Logo from './Logo';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  fullScreen = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const logoSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  };

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className={`border-3 border-orange-500 border-t-transparent rounded-full animate-spin ${sizeClasses[size]}`}></div>
        {message && <span className="ml-2 text-gray-600 dark:text-gray-400">{message}</span>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
      <div className="text-center">
        <div className="bg-orange-500/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 shadow-lg flex items-center justify-center animate-pulse">
          <Logo size={logoSizes[size]} className="text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          TaskDefender
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        <div className={`border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto ${sizeClasses[size]}`}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;