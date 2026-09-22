import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGES } from '../../features/gamification/config/badges';
import { useGamification } from '../../features/gamification/context/GamificationContext';
import clsx from 'clsx';
import { playSound } from '../../utils/sound';

export const BadgeShowcase: React.FC = () => {
    const { state } = useGamification();
    const [justUnlocked, setJustUnlocked] = useState<string | null>(null);

    // Watch for new unlocks to show animation
    useEffect(() => {
        // Simplified: In a real app we'd diff 'prev' vs 'current' state unlockedBadges
        // ensuring we only notify for the LATEST one.
        // Here we just check if the last one in the list is "new" by some logic 
        // or just rely on the user seeing it in the list.
    }, [state.unlockedBadges]);

    return (
        <div className="w-full bg-black/40 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>🏅</span> Sieň Slávy
            </h3>
            
            <div className="grid grid-cols-4 gap-2">
                {BADGES.map((badge) => {
                    const isUnlocked = state.unlockedBadges.includes(badge.id);
                    
                    return (
                        <motion.div
                            key={badge.id}
                            className={clsx(
                                "aspect-square rounded-2xl flex flex-col items-center justify-center p-2 border transition-all",
                                isUnlocked 
                                    ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                                    : "bg-white/5 border-white/5 grayscale opacity-50"
                            )}
                            whileHover={isUnlocked ? { scale: 1.05 } : {}}
                            onClick={() => {
                                if (isUnlocked) playSound('click');
                            }}
                        >
                            <div className="text-3xl mb-1 filter drop-shadow-md">
                                {isUnlocked ? badge.icon : '🔒'}
                            </div>
                            <div className="text-[10px] text-center font-bold text-white/80 leading-tight">
                                {badge.name}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
