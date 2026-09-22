import React, { useEffect, useState, useRef } from 'react';
import { useGamification, getLevelTitle } from '../../features/gamification/context/GamificationContext';
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
    const { state: gamificationState, xpForNextLevel, progressToNextLevel } = useGamification();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const prevLevelRef = useRef<number>(gamificationState.level);

    useEffect(() => {
        if (gamificationState.level > prevLevelRef.current) {
            setShowLevelUp(true);
            const timer = setTimeout(() => setShowLevelUp(false), 3000);
            prevLevelRef.current = gamificationState.level;
            return () => clearTimeout(timer);
        }
    }, [gamificationState.level]);

    const title = getLevelTitle(gamificationState.level);

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
                        <span className={`text-xs font-medium opacity-80 ${textColor}`}>
                            Lvl {gamificationState.level} • {title}
                        </span>
                    </div>
                </button>

                {/* 2. Right: Stats (XP Bar + Gems) */}
                <div className="flex items-center gap-4 pr-4">
                    
                    {/* XP Progress */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                        <div className="w-24 h-2 bg-gray-200/30 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                                style={{ width: `${progressToNextLevel}%` }}
                            />
                        </div>
                        <span className={`text-[10px] font-bold opacity-70 ${textColor}`}>
                            {xpForNextLevel} XP do levelu {gamificationState.level + 1}
                        </span>
                    </div>

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
            {showLevelUp && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-pop-in pointer-events-none">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-6 py-2 rounded-full shadow-xl border-4 border-white transform scale-125">
                        LEVEL UP! {gamificationState.level} 🚀
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHeader;
