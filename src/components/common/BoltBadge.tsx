import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform duration-200 hover:scale-110 hover:shadow-lg"
        title="Built with Bolt.new - World's Largest Hackathon"
      >
        <img
          src="/black_circle_360x360.png"
          alt="Powered by Bolt.new - Made in Bolt.new"
          className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </a>
    </div>
  );
};

export default BoltBadge;