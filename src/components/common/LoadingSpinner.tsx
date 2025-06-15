import React from 'react';
import Logo from './Logo';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-orange-500/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 shadow-lg flex items-center justify-center animate-pulse">
          <Logo size="lg" className="text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          TaskDefender
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Loading your productivity fortress...
        </p>
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;