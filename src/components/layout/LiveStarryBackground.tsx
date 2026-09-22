import React from 'react';

export default function LiveStarryBackground() {
  return (
    <div 
      className="absolute inset-0 overflow-hidden -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #0b1226 0%, #1a1a3e 30%, #0d1b2a 60%, #060819 100%)'
      }}
    />
  );
}
