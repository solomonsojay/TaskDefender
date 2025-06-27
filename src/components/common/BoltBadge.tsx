import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform duration-200 hover:scale-110 hover:shadow-lg"
        title="Built with Bolt.new - AI-powered full-stack development"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" 
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-medium">Built with Bolt.new</span>
        </div>
      </a>
    </div>
  );
};

export default BoltBadge;