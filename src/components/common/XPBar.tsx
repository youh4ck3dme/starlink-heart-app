import { useEffect, useState, useRef, useCallback } from 'react';
import { getPlayerStats, type PlayerStats } from '../../services/xpService';
import ProfileModal from './ProfileModal';

export default function XPBar() {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Track previous level to detect level ups without triggering re-renders
  const prevLevelRef = useRef<number>(0);

  useEffect(() => {
    // Prevent state updates after component unmounts (fixes infinite loop in StrictMode)
    let isMounted = true;
    
    // Load initial stats
    const initialStats = getPlayerStats();
    if (isMounted) {
      setStats(initialStats);
      prevLevelRef.current = initialStats.level;
    }

    // Listen for XP updates - handler is stable and won't cause re-renders
    const handleXPUpdate = () => {
      if (!isMounted) return; // Guard against updates after unmount
      
      const newStats = getPlayerStats();
      
      // Check for level up using ref to avoid dependency cycle
      if (newStats.level > prevLevelRef.current) {
        setShowLevelUp(true);
        setTimeout(() => {
          if (isMounted) setShowLevelUp(false);
        }, 3000);
      }
      
      prevLevelRef.current = newStats.level;
      setStats(newStats);
    };

    window.addEventListener('xp-updated', handleXPUpdate);
    
    // Cleanup: remove listener and mark as unmounted
    return () => {
      isMounted = false;
      window.removeEventListener('xp-updated', handleXPUpdate);
    };
  }, []); // Empty dependency array - runs once on mount

  if (!stats) return null;

  return (
    <>
      {/* XP Bar - Top Right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 neon-snake-border">
        {/* Level Badge - Clickable */}
        <button 
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-black text-sm text-indigo-900">
            {stats.level}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs text-white/70 leading-none">Level {stats.level}</div>
            <div className="text-[10px] text-white/50 leading-none mt-0.5">{stats.title}</div>
          </div>
        </button>

        {/* Progress Bar */}
        <div className="w-32 sm:w-40 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500 ease-out"
            style={{ width: `${stats.progress}%` }}
          />
        </div>

        {/* XP Text */}
        <div className="text-xs font-bold text-white">
          {stats.xpToNextLevel} XP
        </div>

        {/* Streak Fire */}
        {stats.streak > 0 && (
          <div className="text-lg">
            🔥 <span className="text-xs font-bold text-orange-300">{stats.streak}</span>
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 p-1 rounded-3xl animate-glow">
            <div className="bg-slate-900 rounded-3xl px-12 py-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                LEVEL UP!
              </h2>
              <p className="text-2xl font-bold text-white mb-1">Level {stats.level}</p>
              <p className="text-sm text-white/60">{stats.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal 
          onClose={() => setShowProfile(false)}
          gems={0}
          hearts="∞"
        />
      )}
    </>
  );
}
