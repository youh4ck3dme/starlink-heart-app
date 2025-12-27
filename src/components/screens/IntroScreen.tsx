import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import starryAvatar from '../../assets/avatars/starry.webp';

interface IntroScreenProps {
  onStart?: () => void; // Optional - if provided, use this; otherwise use router
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const navigate = useNavigate();
  const [stars, setStars] = useState<{ left: string; top: string; delay: string }[]>([]);

  // Generate random stars on mount - client side only to avoid hydration mismatch
  useEffect(() => {
    const starArray = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`
    }));
    setStars(starArray);
  }, []);

  const handleStart = () => {
    if (onStart) {
      onStart();
    } else {
      navigate('/app');
    }
  };


  return (
    <div className="relative w-full h-full min-h-dvh overflow-hidden flex flex-col items-center justify-center">
      {/* 1. Deep Space Background */}
        {/* 1. Deep Space Galaxy Background */}
        <div 
          className="absolute inset-0 -z-20 bg-black"
          style={{
            background: `
              radial-gradient(circle at 50% 120%, #1a1a40 0%, #000000 70%),
              radial-gradient(circle at 100% 0%, #0b1026 0%, transparent 40%),
              radial-gradient(circle at 0% 0%, #150a24 0%, transparent 40%),
              linear-gradient(to bottom, transparent, #000)
            `
          }}
        />
        {/* Galaxy Nebulas */}
        <div className="absolute inset-0 -z-10 opacity-30 mix-blend-screen"
             style={{
               background: `
                 radial-gradient(circle at 20% 40%, rgba(76, 29, 149, 0.4) 0%, transparent 50%),
                 radial-gradient(circle at 80% 60%, rgba(30, 64, 175, 0.4) 0%, transparent 50%)
               `,
               filter: 'blur(60px)'
             }}
        />

      {/* 2. Layered Stars for Depth */}
      {/* Background (Small, Slow) */}
      {stars.map((star, i) => (
        <div 
          key={`bg-${i}`}
          className="absolute w-[2px] h-[2px] bg-blue-100 rounded-full animate-twinkle opacity-40"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: '4s'
          }}
        />
      ))}
      
      {/* Foreground (Bright, Fast) */}
      {stars.slice(0, 20).map((star, i) => (
        <div 
          key={`fg-${i}`}
          className="absolute w-[3px] h-[3px] bg-white rounded-full animate-twinkle shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            left: star.left, // Reuse positions but could randomize
            top: star.top,
            animationDelay: `${parseFloat(star.delay) + 1}s`,
            animationDuration: '2s'
          }}
        />
      ))}

      {/* 3. Pleiades Cluster (Top Right) */}
      <div className="absolute top-10 right-10 w-32 h-32 opacity-80 rotate-12">
         <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-blue-200 shadow-[0_0_15px_rgba(100,200,255,1)] rounded-full animate-pulse" />
         <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-full" />
         <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-blue-100 shadow-[0_0_12px_rgba(200,220,255,0.9)] rounded-full animate-twinkle" />
         <div className="absolute top-0 right-1/2 w-1 h-1 bg-white opacity-70 rounded-full" />
         <div className="absolute bottom-0 left-1/4 w-1 h-1 bg-white opacity-60 rounded-full" />
         {/* Cluster Glow */}
         <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
      </div>

      {/* 4. Multiple Comets (Shooting Stars) */}
      <div className="absolute top-20 -left-20 w-[200px] h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-white animate-comet rotate-45 opacity-0" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 -right-20 w-[150px] h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-white animate-comet -rotate-[135deg] opacity-0" style={{ animationDelay: '5s', animationDuration: '7s' }} />
      <div className="absolute bottom-1/4 -left-20 w-[300px] h-[3px] bg-gradient-to-r from-transparent via-purple-300 to-white animate-comet rotate-[30deg] opacity-0" style={{ animationDelay: '8s', animationDuration: '10s' }} />


      {/* 3. Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        
        {/* Floating Mascot */}
        <div className="relative mb-8">
            {/* Glow effect behind mascot */}
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
            
            <motion.img 
              src={starryAvatar} 
              alt="Starry Iskra" 
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain relative z-10 drop-shadow-2xl animate-float"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            />
            
            {/* Quick Badge */}
            <motion.div 
                className="absolute -right-4 top-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg rotate-12 z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                AI Kamoš
            </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h1 className="text-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-200 font-black mb-2 drop-shadow-sm tracking-tight">
              Starlink Heart
            </h1>
            <p className="text-blue-200/80 text-lg mb-10 font-medium leading-relaxed">
              Tvoj sprievodca vesmírom vedomostí.<br/>
              <span className="text-sm opacity-70">Učenie • Hra • Zábava</span>
            </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] overflow-hidden"
        >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            
            <div className="flex items-center justify-center gap-3 relative z-10">
                <span className="text-xl font-bold text-white tracking-wide">Začať misiu</span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">🚀</span>
            </div>
        </motion.button>
        
        {/* Footer info */}
        <motion.p 
            className="mt-8 text-xs text-blue-300/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
        >
            Verzia 1.0.0 • Vyrobené pre prieskumníkov
        </motion.p>
      </div>
    </div>
  );
}
