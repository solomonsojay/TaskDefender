import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-8',
    md: 'w-8 h-10',
    lg: 'w-12 h-15'
  };

  return (
    <svg 
      viewBox="0 0 144 181" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      <path 
        d="M2 95.1346V25.2668C2 16.6622 12.0928 12.0201 18.626 17.62L81.0081 71.0904C83.2482 73.0104 84.5374 75.8135 84.5374 78.7639V156.187C84.5374 165.141 73.7547 169.672 67.3584 163.407L5.03421 102.354C3.09361 100.453 2 97.8512 2 95.1346Z" 
        stroke="currentColor" 
        strokeWidth="3.36887"
        fill="url(#mainGradient)"
        className="text-white"
      />
      <path 
        d="M15.4746 64.0098L23.7865 90.1328C25.6325 95.9345 32.1512 98.7991 37.6734 96.2352L74.4299 79.1697" 
        stroke="white" 
        strokeWidth="10.1066"
        className="drop-shadow-sm"
      />
      <defs>
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;