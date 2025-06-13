import React from 'react';

const BadgeSystem: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-200">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Badge System
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Gamification features coming soon...
      </p>
    </div>
  );
};

export default BadgeSystem;