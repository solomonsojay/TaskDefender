import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform duration-200 hover:scale-110 hover:shadow-lg"
        title="Powered by Bolt.new - AI-powered full-stack development"
      >
        <div className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 bg-black flex items-center justify-center text-white font-bold text-xl">
          ⚡
        </div>
      </a>
    </div>
  );
};

export default BoltBadge;