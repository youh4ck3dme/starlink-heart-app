import { useState, useEffect } from 'react';
import welcomeImg from '../assets/image.png';

export default function WelcomeScreen() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Parallax Effect Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Calculate movement relative to center (range -1 to 1)
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    
    // Multiplier for intensity (20px movement)
    setOffset({ x: x * 20, y: y * 20 });
  };

  // Gyroscope/Device Orientation support for mobile "sweaty" feel
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
        if (!e.gamma || !e.beta) return;
        // Gamma: Left/Right (-90 to 90), clamp to -45/45
        const x = Math.min(Math.max(e.gamma, -45), 45) / 45; 
        // Beta: Front/Back (-180 to 180), clamp to existing range
        const y = Math.min(Math.max(e.beta - 45, -45), 45) / 45; 

        setOffset({ x: x * 20, y: y * 20 });
    };

    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div 
        className="relative h-[100dvh] w-full overflow-hidden bg-slate-900 text-white perspective-1000"
        onMouseMove={handleMouseMove}
    >
      
      {/* Background Image - Parallax Layer */}
      {/* Scaled up 110% to prevent edges showing during movement */}
      <div 
        className="absolute inset-[-5%] w-[110%] h-[110%] transition-transform duration-100 ease-out will-change-transform"
        style={{ 
            transform: `translate3d(${-offset.x}px, ${-offset.y}px, 0) scale(1.05)` 
        }}
      >
         <img 
            src={welcomeImg} 
            alt="Starlink Heart Background" 
            className="w-full h-full object-cover"
          />
          {/* Enhanced Cinematic Overlay: Darker bottom, subtle top tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-blue-900/10 mix-blend-multiply" />
      </div>

      {/* Content Container - Z-indexed above parallax */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-12 sm:pb-24 px-6 gap-8 animate-fade-in-up">
        
        {/* Title removed per request, but keeping structure clean */}
        
        {/* Premium CTA Button */}
        <button 
          onClick={() => {
            window.location.href = '/home';
          }}
          className="group relative w-full max-w-[280px] flex items-center justify-center px-8 py-5 
                     bg-gradient-to-r from-blue-600 to-blue-500 
                     text-white font-black text-xl tracking-wider uppercase
                     rounded-2xl 
                     shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)]
                     transition-all duration-300 transform
                     hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(37,99,235,0.8)] hover:-translate-y-1
                     active:scale-95 active:shadow-inner"
        >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
            </div>
            
            <span className="relative z-10 flex items-center gap-3 drop-shadow-md">
                Začať misiu 
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
            </span>
        </button>

        {/* Safe Area Spacer for modern notches/home bars */}
        <div className="h-4 w-full" />
      </div>
    </div>
  );
}
