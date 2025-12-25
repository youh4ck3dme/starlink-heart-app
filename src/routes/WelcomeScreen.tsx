import { useState, useEffect, useMemo } from 'react';
import heroImg from '../assets/image.png';

// Floating particles config
const PARTICLES = [
  { text: 'A', delay: 0, duration: 15, left: '10%' },
  { text: 'B', delay: 3, duration: 18, left: '25%' },
  { text: 'C', delay: 6, duration: 12, left: '75%' },
  { text: '2+2', delay: 2, duration: 20, left: '85%' },
  { text: '?', delay: 8, duration: 14, left: '50%' },
  { text: '✨', delay: 4, duration: 16, left: '15%' },
  { text: '⭐', delay: 10, duration: 13, left: '65%' },
  { text: '🔢', delay: 5, duration: 17, left: '40%' },
];

// Star positions for background
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: Math.random() * 3,
  size: Math.random() * 2 + 1,
}));

export default function WelcomeScreen() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Parallax Effect Handler (pointer for both mouse and touch)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (prefersReducedMotion) return;
    
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    
    setOffset({ x: x * 15, y: y * 15 });
  };

  // Gyroscope support for mobile
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!e.gamma || !e.beta) return;
      const x = Math.min(Math.max(e.gamma, -45), 45) / 45;
      const y = Math.min(Math.max(e.beta - 45, -45), 45) / 45;
      setOffset({ x: x * 15, y: y * 15 });
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [prefersReducedMotion]);

  return (
    <div 
      className="relative min-h-[100svh] w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950"
      onPointerMove={handlePointerMove}
    >
      {/* Layer 1: Animated Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Layer 2: Floating Particles (A, B, C, 2+2) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute bottom-0 text-2xl font-bold text-white/40 animate-particle select-none"
            style={{
              left: p.left,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.text}
          </div>
        ))}
      </div>

      {/* Layer 3: Hero Image with Parallax + Float + Glow */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out"
        style={{ 
          transform: prefersReducedMotion 
            ? 'none' 
            : `translate3d(${offset.x}px, ${offset.y}px, 0)` 
        }}
      >
        <div className="relative w-[80%] max-w-[400px] aspect-square animate-float">
          {/* Glow behind image */}
          <div className="absolute inset-[-20%] rounded-full bg-blue-500/20 blur-3xl animate-glow" />
          
          {/* Hero Image */}
          <img 
            src={heroImg} 
            alt="Starlink Heart" 
            className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Layer 4: Gradient Overlay (bottom fade) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

      {/* Layer 5: Content */}
      <div className="relative z-20 min-h-[100svh] flex flex-col items-center justify-end safe-area-bottom px-6 pb-8 sm:pb-12">
        
        {/* CTA Button with Glow */}
        <button 
          onClick={() => window.location.href = '/home'}
          className="group relative w-full max-w-[300px] flex items-center justify-center px-8 py-5 
                     bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 
                     text-white font-black text-xl tracking-wider uppercase
                     rounded-2xl animate-glow
                     transition-all duration-300 transform
                     hover:scale-105 hover:-translate-y-1
                     active:scale-95"
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
          </div>
          
          <span className="relative z-10 flex items-center gap-3 drop-shadow-lg">
            Začať misiu 
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
          </span>
        </button>

        {/* Version / Branding */}
        <p className="mt-6 text-xs text-white/30 tracking-widest uppercase">
          Starlink Heart • v1.0
        </p>
      </div>
    </div>
  );
}
