import React, { useEffect, useState } from 'react';
import { getDailyMissions, claimMissionReward, Mission } from '../../services/missionService';

interface DailyMissionsCardProps {
    onGemEarned: (amount: number) => void;
}

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({ onGemEarned }) => {
    const [missions, setMissions] = useState<Mission[]>([]);

    const loadMissions = () => {
        setMissions(getDailyMissions());
    };

    useEffect(() => {
        loadMissions();
        window.addEventListener('missions-updated', loadMissions);
        return () => window.removeEventListener('missions-updated', loadMissions);
    }, []);

    const handleClaim = (mission: Mission) => {
        if (mission.completed || mission.progress < mission.target) return;
        
        const reward = claimMissionReward(mission.id);
        if (reward > 0) {
            onGemEarned(reward);
            // Trigger confetti or sound here if desired
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 animate-fade-in-up">
            <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <span>🎯</span> Denné Misie
            </h3>
            
            <div className="space-y-4">
                {missions.map(mission => {
                    const isReadyToClaim = !mission.completed && mission.progress >= mission.target;
                    const percent = Math.min((mission.progress / mission.target) * 100, 100);

                    return (
                        <div key={mission.id} className="relative bg-indigo-50 rounded-2xl p-4 border border-indigo-100 overflow-hidden">
                            {/* Progress Background */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 bg-indigo-100/50 transition-all duration-1000" 
                                style={{ width: `${percent}%` }}
                            />
                            
                            <div className="relative flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-800 text-sm mb-1">{mission.label}</div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {mission.completed ? 'Dokončené' : `${mission.progress} / ${mission.target}`}
                                    </div>
                                </div>

                                {mission.completed ? (
                                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <span>✓</span> Hotovo
                                    </div>
                                ) : isReadyToClaim ? (
                                    <button 
                                        onClick={() => handleClaim(mission)}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md animate-bounce active:scale-95 transition-transform"
                                    >
                                        Získať 💎{mission.reward}
                                    </button>
                                ) : (
                                    <div className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">
                                        💎 {mission.reward}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
