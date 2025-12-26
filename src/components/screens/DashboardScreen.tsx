import React from 'react';
import DashboardHeader from '../layout/DashboardHeader';
import MascotRenderer, { MascotMode } from '../mascot/MascotRenderer';
import { DailyMissionsCard } from '../gamification/DailyMissionsCard';

interface DashboardScreenProps {
    onNewMission: () => void;
    onProfile: () => void;
    onCenter: () => void;
    onCoachToggle: () => void;
    onGemEarned?: (amount: number) => void;
    isCoachMode: boolean;
    avatar: string;
    gems: number;
    textColor: string;
    mascotMode: MascotMode;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
    onNewMission,
    onProfile,
    onCenter,
    onCoachToggle,
    onGemEarned,
    isCoachMode,
    avatar,
    gems,
    textColor,
    mascotMode
}) => {
    return (
        <div className="relative min-h-[calc(100dvh-80px)] flex flex-col items-center px-4 pt-4 pb-24 touch-pan-y select-none">
            
            {/* Header */}
            <DashboardHeader 
                avatar={avatar} 
                gems={gems} 
                textColor={textColor}
                onProfile={onProfile}
            />

            {/* Mascot Area */}
            <div className={`w-full flex-1 flex flex-col items-center justify-center min-h-[280px] transition-all duration-700`}>
                <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                    <MascotRenderer 
                         mode={mascotMode}
                         className="w-full h-full"
                    />
                </div>
            </div>

            {/* Daily Missions */}
            {onGemEarned && (
                <div className="w-full max-w-sm mb-6">
                    <DailyMissionsCard onGemEarned={onGemEarned} />
                </div>
            )}

            {/* Action Buttons */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-4 z-20">
                <button 
                    onClick={onNewMission}
                    data-testid="start-mission-btn"
                    className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-5 rounded-3xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-3xl"></div>
                    <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
                    <span className="font-black text-xl tracking-wide uppercase">Nová Misia</span>
                </button>

                <button 
                    onClick={onCoachToggle}
                    className={`p-4 rounded-2xl shadow-lg border-2 transition-all active:scale-95 flex flex-col items-center gap-1 ${
                        isCoachMode 
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800' 
                            : 'bg-white/90 border-white text-gray-600 hover:bg-white'
                    }`}
                >
                    <span className="text-2xl">🎓</span>
                    <span className="font-bold text-xs uppercase">{isCoachMode ? 'Kouč: ON' : 'Kouč: OFF'}</span>
                </button>

                <button 
                    onClick={onCenter}
                    data-testid="open-settings-btn"
                    className="bg-white/90 hover:bg-white p-4 rounded-2xl shadow-lg border-2 border-white transition-all active:scale-95 flex flex-col items-center gap-1 text-gray-600"
                >
                    <span className="text-2xl">⚙️</span>
                    <span className="font-bold text-xs uppercase">Centrum</span>
                </button>
            </div>
        </div>
    );
};

export default DashboardScreen;
