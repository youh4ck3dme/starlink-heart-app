import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import introBg from '../assets/intro-bg.webp';

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

  // Parallax Effect Handler
  const handlePointerMove = (e: React.PointerEvent) => {
    if (prefersReducedMotion) return;
    
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    
    setOffset({ x: x * 10, y: y * 10 });
  };

  // Gyroscope support for mobile
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    let isActive = true;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!isActive || !e.gamma || !e.beta) return;
      const x = Math.min(Math.max(e.gamma, -45), 45) / 45;
      const y = Math.min(Math.max(e.beta - 45, -45), 45) / 45;
      setOffset({ x: x * 10, y: y * 10 });
    };

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
      className="relative min-h-dvh w-full overflow-hidden bg-black text-white"
      onPointerMove={handlePointerMove}
    >
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 transition-transform duration-100 ease-out will-change-transform"
        style={{ 
          transform: prefersReducedMotion 
            ? 'none' 
            : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.05)` 
        }}
      >
        <img 
          src={introBg} 
          alt="Welcome to Starlink Heart" 
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 min-h-dvh flex flex-col items-center justify-end safe-area-bottom px-6 pb-12 sm:pb-20">
        
        {/* CTA Button with Glow */}
        <button 
          onClick={() => {
            localStorage.setItem('hasStarted', 'true');
            navigate('/home');
          }}
          className="group relative w-full max-w-[300px] flex items-center justify-center px-8 py-5 
                     bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 
                     text-white font-black text-xl tracking-wider uppercase
                     rounded-2xl animate-glow
                     transition-all duration-300 transform
                     hover:scale-105 hover:-translate-y-1
                     active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:animate-[shine_2s_ease-in-out]" />
          </div>
          
          <span className="relative z-10 flex items-center gap-3 drop-shadow-lg">
            Začať misiu 
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
          </span>
        </button>

        {/* Version / Branding */}
        <p className="mt-6 text-xs text-white/40 tracking-widest uppercase">
          Starlink Heart • v1.1
        </p>
      </div>
    </div>
  );
}

