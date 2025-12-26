import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useHaptics } from '../../hooks/useHaptics';

// Assets
import starAvatar from '../../assets/avatars/starry.webp';
import cometAvatar from '../../assets/avatars/cometa.webp';
// Use roboto.png if webp not available, or keep webp if verified
import robotAvatar from '../../assets/avatars/roboto.webp';

interface PlanetProps {
  id: string;
  name: string;
  levelRange: string;
  avatar: string;
  color: string;
  glowColor: string;
  isLocked?: boolean;
  delay: number;
  onClick: () => void;
  position: 'left' | 'right' | 'center';
}

const Planet = ({ id, name, levelRange, avatar, color, glowColor, isLocked, delay, onClick, position }: PlanetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: position === 'left' ? -50 : position === 'right' ? 50 : 0 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, type: "spring" }}
      className={`relative flex flex-col items-center ${position === 'left' ? 'self-start ml-8' : position === 'right' ? 'self-end mr-8' : 'self-center'}`}
    >
      {/* Planet Aura / Glow */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative group focus:outline-none"
      >
        <div className={`absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 animate-pulse`} 
             style={{ backgroundColor: glowColor }} />
        
        {/* Planet Core */}
        <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 shadow-2xl overflow-hidden backdrop-blur-sm bg-black/40 flex items-center justify-center transform transition-transform duration-500`}
             style={{ borderColor: color, boxShadow: `0 0 30px ${glowColor}40` }}>
             
             {/* Avatar */}
             <img src={avatar} alt={name} className="w-4/5 h-4/5 object-contain drop-shadow-lg z-10" />
             
             {/* Locked Overlay */}
             {isLocked && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-[2px]">
                 <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🔒</span>
               </div>
             )}
        </div>

        {/* Floating Label */}
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-max text-center">
            <h3 className="font-black text-lg sm:text-xl uppercase tracking-wider text-white drop-shadow-md" 
                style={{ textShadow: `0 0 10px ${glowColor}` }}>
              {name}
            </h3>
            <span className="text-xs font-bold text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
              LVL {levelRange}
            </span>
        </div>
      </motion.button>
    </motion.div>
  );
};

interface GalaxyRoadmapProps {
  onEnter?: (id: string) => void;
}

export default function GalaxyRoadmap({ onEnter }: GalaxyRoadmapProps) {
  const haptics = useHaptics();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleStartMission = (planetId: string) => {
    haptics.mediumTap();
    onEnter?.(planetId);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg mx-auto pb-40 pt-10 px-4">
      
      {/* Connecting Path (SVG) */}
      <div className="absolute top-24 bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[300px] pointer-events-none -z-10 h-[85%]">
         <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
             {/* Base Path (Dashed) */}
             <motion.path
                d="M 150 0 C 50 150, 250 300, 150 450 C 50 600, 250 750, 150 900" 
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="4"
                strokeDasharray="12 12"
             />
             {/* Active Gradient Path */}
             <motion.path
                d="M 150 0 C 50 150, 250 300, 150 450 C 50 600, 250 750, 150 900"
                fill="none"
                stroke="url(#gradientPath)"
                strokeWidth="6"
                strokeLinecap="round"
                style={{ pathLength }}
             />
             <defs>
               <linearGradient id="gradientPath" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#22d3ee" />   {/* Cyan */}
                 <stop offset="50%" stopColor="#a855f7" />  {/* Purple */}
                 <stop offset="100%" stopColor="#eab308" /> {/* Gold */}
               </linearGradient>
               {/* Glow Filter */}
               <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                 <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                 <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
                 </feMerge>
               </filter>
             </defs>
         </svg>
      </div>

      <div className="flex flex-col gap-36 relative z-10">
          {/* GALAXIA 1: Železná Hmlovina (Start) */}
          <Planet 
            id="robot"
            name="Železná Hmlovina"
            levelRange="1-10"
            avatar={robotAvatar}
            color="#22d3ee" // Cyan
            glowColor="#0ea5e9"
            delay={0.2}
            position="center"
            onClick={() => handleStartMission('robot')}
          />

          {/* GALAXIA 2: Ľadový Chvost Kométy */}
          <Planet 
            id="comet"
            name="Ľadový Chvost"
            levelRange="11-20"
            avatar={cometAvatar}
            color="#e0f2fe" // Ice Blue
            glowColor="#38bdf8"
            delay={0.3}
            position="right"
            isLocked={true} // For demo purpose locked
            onClick={() => haptics.errorVibrate()}
          />

          {/* GALAXIA 3: Hviezdne Jadro */}
          <Planet 
            id="starry"
            name="Hviezdne Jadro"
            levelRange="21-30"
            avatar={starAvatar}
            color="#eab308" // Gold
            glowColor="#facc15"
            delay={0.4}
            position="left"
            isLocked={true}
            onClick={() => haptics.errorVibrate()}
          />
      </div>

      {/* Start Button (Still accessible at bottom) */}
      <motion.div 
         initial={{ opacity: 0, y: 50 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         transition={{ delay: 0.5, duration: 0.8 }}
         className="mt-24 flex justify-center"
      >
        <button 
          onClick={() => handleStartMission('quick')}
          className="text-white/60 text-sm font-medium hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white/60 pb-1"
        >
          Preskočiť intro ⏩
        </button>
      </motion.div>

    </div>
  );
}
