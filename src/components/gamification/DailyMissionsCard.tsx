import React, { useState, useEffect } from 'react';
import { Check, RefreshCw } from 'lucide-react'; // Added Refresh icon
import { motion, AnimatePresence } from 'framer-motion';
import { tapHaptic, successHaptic } from '../../utils/haptics';
import { RewardConfetti } from '../effects/RewardConfetti';
import clsx from 'clsx';
import { playSound } from '../../utils/sound';
import { generateDailyChallenges, Challenge } from '../../features/gamification/services/aiRewardEngine';

interface DailyMissionsCardProps {
    onGemEarned: (amount: number) => void;
}

interface Mission extends Challenge {
    completed: boolean;
}

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({ onGemEarned }) => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        loadMissions();
    }, []);

    const loadMissions = async () => {
        setLoading(true);
        // Mock profile for now - later connect to real user profile
        const profile = { id: 'user-1', age: 9, weakSkills: ['math', 'science'] as any[] };
        const challenges = await generateDailyChallenges(profile);
        
        setMissions(challenges.map(c => ({ ...c, completed: false })));
        setLoading(false);
    };

    const toggleMission = async (id: string) => {
        const mission = missions.find(m => m.id === id);
        if (!mission) return;

        if (!mission.completed) {
            // Completing mission
            await successHaptic();
            playSound('success'); 
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
            
            setMissions(missions.map(m => 
                m.id === id ? { ...m, completed: true } : m
            ));
            
            // Delay gem reward slightly for effect
            setTimeout(() => onGemEarned(mission.xpReward), 500);
        } else {
            // Un-completing
            await tapHaptic();
            playSound('click');
            setMissions(missions.map(m => 
                m.id === id ? { ...m, completed: false } : m
            ));
        }
    };

    const completedCount = missions.filter(m => m.completed).length;
    const progress = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;

    return (
        <div className="relative w-full overflow-hidden rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-xl p-5">
            {showConfetti && <RewardConfetti />}
            
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="text-2xl">🎯</span> 
                    Denné Misie
                </h3>
                <div className="flex items-center gap-2">
                    {loading && <RefreshCw size={14} className="text-white/50 animate-spin" />}
                    <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-white font-medium border border-white/5">
                        {completedCount}/{missions.length}
                    </div>
                </div>
            </div>

            {/* Progress Bar with Shimmer */}
            <div className="relative h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                >
                    <div className="absolute inset-0 bg-white/30 w-full animate-shine" />
                </motion.div>
            </div>

            <div className="space-y-3 relative z-10 min-h-[100px]">
                {loading && missions.length === 0 ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-full h-12 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    missions.map((mission, index) => (
                        <motion.button
                            key={mission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => toggleMission(mission.id)}
                            className={clsx(
                                "w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-300 border text-left group",
                                mission.completed 
                                    ? "bg-emerald-500/10 border-emerald-500/30" 
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={clsx(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
                                mission.completed 
                                    ? "bg-emerald-500 border-emerald-500" 
                                    : "border-white/30 group-hover:border-white/50"
                            )}>
                                {mission.completed && <Check size={14} className="text-white" />}
                            </div>
                            
                            <span className={clsx(
                                "flex-1 text-sm font-medium transition-colors",
                                mission.completed ? "text-white/50 line-through" : "text-white"
                            )}>
                                {mission.title}
                            </span>

                            <div className={clsx(
                                "text-xs px-2 py-1 rounded bg-black/20 font-bold",
                                mission.completed ? "text-emerald-400" : "text-yellow-400"
                            )}>
                                +{mission.xpReward} 💎
                            </div>
                        </motion.button>
                    ))
                )}
            </div>
        </div>
    );
};
