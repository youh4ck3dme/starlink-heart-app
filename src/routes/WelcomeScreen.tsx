import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/welcome-hero.png';

// Floating particles config (limited for performance)
const PARTICLES = [
  { text: 'A', delay: 0, duration: 18, left: '12%' },
  { text: 'B', delay: 4, duration: 22, left: '30%' },
  { text: '2+2', delay: 2, duration: 25, left: '70%' },
  { text: '?', delay: 6, duration: 20, left: '85%' },
  { text: '✦', delay: 8, duration: 16, left: '50%' },
  { text: '•', delay: 10, duration: 19, left: '20%' },
];

// Stars - fewer, CSS-optimized (only 12 for performance)
const STARS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${10 + (i * 7) % 80}%`,
  top: `${5 + (i * 8) % 85}%`,
  delay: (i * 0.4) % 3,
  size: 1 + (i % 3),
}));

export default function WelcomeScreen() {
  const navigate = useNavigate();
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

  // Gyroscope support for mobile (with iOS 13+ permission handling)
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    let isActive = true;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!isActive || !e.gamma || !e.beta) return;
      const x = Math.min(Math.max(e.gamma, -45), 45) / 45;
      const y = Math.min(Math.max(e.beta - 45, -45), 45) / 45;
      setOffset({ x: x * 15, y: y * 15 });
    };

    // Try to add listener (works on Android, older iOS) - requires Secure Context
    if (window.isSecureContext && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }
    
    return () => {
      isActive = false;
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [prefersReducedMotion]);

  return (
    <div 
      className="relative min-h-dvh w-full overflow-hidden bg-[#060819] text-white"
      onPointerMove={handlePointerMove}
    >
      {/* Layer 1: Animated Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle will-change-[opacity,transform]"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
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
            className="absolute bottom-0 text-xl font-medium text-white/30 animate-particle select-none will-change-transform"
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

      {/* Layer 3: Hero Image - DISABLED for background testing
      <div 
        className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
        style={{ 
          transform: prefersReducedMotion 
            ? 'none' 
            : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.05)` 
        }}
      >
        <img 
          src={heroImg}
          alt="Starlink Heart Hero"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay pointer-events-none" />
      </div>
      */}

      {/* Layer 4: Gradient Overlay (bottom fade) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

      {/* Layer 5: Content */}
      <div className="relative z-20 min-h-dvh flex flex-col items-center justify-end safe-area-bottom px-6 pb-8 sm:pb-12">
        
        {/* CTA Button with Glow */}
        <button 
          onClick={() => {
            // Mark user as started to persist navigation state
            localStorage.setItem('hasStarted', 'true');
            navigate('/home');
          }}
          className="group relative w-full max-w-[300px] flex items-center justify-center px-8 py-5 
                     bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 
                     text-white font-black text-xl tracking-wider uppercase
                     rounded-2xl animate-glow
                     transition-all duration-300 transform
                     hover:scale-105 hover:-translate-y-1
                     active:scale-95"
        >
          {/* Shine Effect - only on hover to save battery */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:animate-[shine_2s_ease-in-out]" />
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
