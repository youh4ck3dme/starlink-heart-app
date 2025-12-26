import React from 'react';
import CosmicBackground from '../background/CosmicBackground';

export default function LiveStarryBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-black pointer-events-none">
      <CosmicBackground variant="luxury" intensity={0.8} className="w-full h-full" />
    </div>
  );
}
