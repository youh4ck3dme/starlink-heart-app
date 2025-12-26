import React, { useEffect, useState, useRef } from 'react';
import { getPlayerStats, type PlayerStats } from '../../services/xpService';
import StarryAvatarDisplay from '../common/StarryAvatarDisplay';

interface DashboardHeaderProps {
    avatar: string;
    gems: number;
    textColor: string;
    onProfile: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
    avatar, 
    gems, 
    textColor, 
    onProfile 
}) => {
    // XP State Logic (reused from XPBar)
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const prevLevelRef = useRef<number>(0);

    useEffect(() => {
        let isMounted = true;
        
        // Initial load
        const initialStats = getPlayerStats();
        if (isMounted) {
            setStats(initialStats);
            prevLevelRef.current = initialStats.level;
        }

        // Listener
        const handleXPUpdate = () => {
            if (!isMounted) return;
            const newStats = getPlayerStats();
            
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
        return () => {
            isMounted = false;
            window.removeEventListener('xp-updated', handleXPUpdate);
        };
    }, []);

    // Color adaptation for the header background
    const isDarkText = textColor.includes('gray-800');
    const glassClass = isDarkText 
        ? 'bg-white/40 border-white/40' 
        : 'bg-slate-900/40 border-white/10';

    return (
        <div className="w-full mb-8 relative z-20">
            <div className={`flex items-center justify-between p-2 rounded-[2rem] border backdrop-blur-md shadow-lg transition-colors duration-500 ${glassClass}`}>
                
                {/* 1. Left: Profile Button (Kadet) */}
                <button 
                    onClick={onProfile}
                    data-testid="profile-btn"
                    className="flex items-center gap-3 pl-1 pr-6 py-1 rounded-full hover:bg-white/10 transition-colors group"
                >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                        <StarryAvatarDisplay avatar={avatar} size="text-2xl" isFloating={false} />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className={`font-black text-lg ${textColor}`}>Kadet</span>
                        {stats && (
                            <span className={`text-xs font-medium opacity-80 ${textColor}`}>
                                Lvl {stats.level} • {stats.title}
                            </span>
                        )}
                    </div>
                </button>

                {/* 2. Right: Stats (XP Bar + Gems) */}
                <div className="flex items-center gap-4 pr-4">
                    
                    {/* XP Progress (Hidden on very small screens if needed, but important for game) */}
                    {stats && (
                        <div className="hidden sm:flex flex-col items-end gap-1">
                            <div className="w-24 h-2 bg-gray-200/30 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                                    style={{ width: `${stats.progress}%` }}
                                />
                            </div>
                            <span className={`text-[10px] font-bold opacity-70 ${textColor}`}>
                                {stats.xpToNextLevel} XP do levelu {stats.level + 1}
                            </span>
                        </div>
                    )}

                    {/* Gems */}
                    <div className="flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30 shadow-sm">
                        <span className="text-lg">💎</span>
                        <span className={`font-bold ${isDarkText ? 'text-yellow-700' : 'text-yellow-200'}`}>
                            {gems}
                        </span>
                    </div>
                </div>
            </div>

            {/* Level Up Notification (Overlay) */}
            {showLevelUp && stats && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-pop-in pointer-events-none">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-6 py-2 rounded-full shadow-xl border-4 border-white transform scale-125">
                        LEVEL UP! {stats.level} 🚀
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHeader;
