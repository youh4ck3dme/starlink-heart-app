import React from 'react';

// Stars - Increased count for a denser, more magical sky
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  size: Math.random() < 0.3 ? 2 + Math.random() * 2 : 1 + Math.random(), // Mix of tiny and larger stars
  duration: 1.5 + Math.random() * 4,
  opacity: 0.4 + Math.random() * 0.6
}));

export default function LiveStarryBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle will-change-[opacity,transform]"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            opacity: star.opacity
          }}
        />
      ))}
      
      {/* Optional: Add a subtle nebula/glow effect if desired */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>

      {/* Shooting Star / Comet */}
      <div className="absolute top-10 right-10 w-[150px] h-[2px] bg-gradient-to-l from-white to-transparent animate-comet opacity-0">
         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"></div>
      </div>
    </div>
  );
}
