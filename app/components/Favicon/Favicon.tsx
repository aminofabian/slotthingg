import React from 'react';

const Favicon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="32"
      height="32"
    >
      {/* Background Circle */}
      <circle cx="16" cy="16" r="16" fill="#0f172a" />
      
      {/* Slot Machine Design */}
      <g transform="translate(6, 6)">
        {/* Outer Frame */}
        <rect
          x="0"
          y="0"
          width="20"
          height="20"
          rx="4"
          fill="none"
          stroke="#00ffff"
          strokeWidth="2"
        />
        
        {/* Display Windows */}
        <rect
          x="4"
          y="4"
          width="12"
          height="12"
          rx="2"
          fill="#00ffff"
          opacity="0.2"
        />
        
        {/* Decorative Elements */}
        <circle cx="10" cy="10" r="3" fill="#00ffff" />
        
        {/* Sparkles */}
        <g fill="#00ffff">
          <circle cx="4" cy="4" r="1" />
          <circle cx="16" cy="4" r="1" />
          <circle cx="4" cy="16" r="1" />
          <circle cx="16" cy="16" r="1" />
        </g>
      </g>
    </svg>
  );
};

export default Favicon;
