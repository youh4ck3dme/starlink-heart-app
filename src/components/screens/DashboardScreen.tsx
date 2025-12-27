import React, { useState } from 'react';
import DashboardHeader from '../layout/DashboardHeader';
import MascotRenderer, { MascotMode } from '../mascot/MascotRenderer';
import { DailyMissionsCard } from '../gamification/DailyMissionsCard';
import { LeaderboardWidget } from '../gamification/LeaderboardWidget';
import { LeaderboardFull } from '../gamification/LeaderboardFull';
import { AnimatePresence } from 'framer-motion';
import logo3d from '../../assets/logo_3d.webp';

interface DashboardScreenProps {
    onNewMission: () => void;
    onProfile: () => void;
    onCenter: () => void;
    onCoachToggle: () => void;
    onSchoolDashboard: () => void;
    onEduPage: () => void;
    onGemEarned?: (amount: number) => void;
    isCoachMode: boolean;
    avatar: string;
    gems: number;
    textColor: string;
    mascotMode: MascotMode;
    showIntro?: boolean;
    gender: 'boy' | 'girl' | 'unspecified';
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
    onNewMission,
    onProfile,
    onCenter,
    onCoachToggle,
    onSchoolDashboard,
    onEduPage,
    onGemEarned,
    isCoachMode,
    avatar,
    gems,
    textColor,
    mascotMode,
    showIntro = false,
    gender
}) => {
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    return (
        <div className="relative min-h-[calc(100dvh-80px)] flex flex-col items-center px-4 pt-4 pb-24 touch-pan-y select-none">
            {/* 3D Planet Decoration Removed for simplicity */}
            
            {/* Header */}
            <DashboardHeader 
                avatar={avatar} 
                gems={gems} 
                textColor={textColor}
                onProfile={onProfile}
            />

            {/* Mascot Area - Modified Layout */}
            <div className={`w-full flex-1 flex flex-col items-center justify-center min-h-[300px] transition-all duration-700`}>
                <div className="relative w-full max-w-sm flex flex-col items-center justify-center gap-4">
                    {/* Floating 3D Logo */}
                    <img 
                        src={logo3d} 
                        alt="Starlink Heart Logo" 
                        className="w-32 h-auto animate-bounce-slow drop-shadow-lg z-10"
                    />
                    
                    {/* Starry Avatar */}
                    <div className="w-full aspect-square max-w-[280px] flex items-center justify-center">
                        <MascotRenderer 
                             mode="image" 
                             avatar={avatar}
                             gender={gender}
                             className="w-full h-full drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Intro Text for Main Avatar */}
            {showIntro && (
                <div className="w-full max-w-sm mb-6 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 text-center shadow-lg transform hover:scale-[1.02] transition-transform animate-float">
                    <p className="text-white text-sm md:text-base font-medium">
                        Ahoj! 👋 Klikni na <span className="font-bold text-yellow-300">"Nová Misia"</span> a opýtaj sa ma čokoľvek! Môžeme si pozrieť aj fotky! 📸✨
                    </p>
                </div>
            )}

            {/* Gamification Widgets */}
            <div className="w-full max-w-sm space-y-4 mb-4">
                {onGemEarned && (
                    <DailyMissionsCard onGemEarned={onGemEarned} />
                )}
                
                {/* Leaderboard Widget */}
                <LeaderboardWidget onShowFull={() => setShowLeaderboard(true)} />
            </div>

            {/* Action Buttons - Main CTA */}
            <div className="w-full max-w-sm space-y-3 z-20">
                <button 
                    onClick={onNewMission}
                    data-testid="start-mission-btn"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-2xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                    <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
                    <span className="font-black text-lg tracking-wide uppercase">Nová Misia</span>
                </button>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-4 gap-2">
                    <button 
                        onClick={onSchoolDashboard}
                        data-testid="school-dashboard-btn"
                        className="bg-emerald-500/90 hover:bg-emerald-500 p-3 rounded-xl shadow-lg transition-all active:scale-95 flex flex-col items-center gap-1 text-white"
                    >
                        <span className="text-xl">📚</span>
                        <span className="font-bold text-[10px] uppercase">Škola</span>
                    </button>

                    <button 
                        onClick={onEduPage}
                        data-testid="edupage-btn"
                        className="bg-purple-500/90 hover:bg-purple-500 p-3 rounded-xl shadow-lg transition-all active:scale-95 flex flex-col items-center gap-1 text-white"
                    >
                        <span className="text-xl">🎓</span>
                        <span className="font-bold text-[10px] uppercase">EduPage</span>
                    </button>

                    <button 
                        onClick={onCoachToggle}
                        className={`p-3 rounded-xl shadow-lg transition-all active:scale-95 flex flex-col items-center gap-1 ${
                            isCoachMode 
                                ? 'bg-amber-400 text-amber-900' 
                                : 'bg-white/90 text-gray-600 hover:bg-white'
                        }`}
                    >
                        <span className="text-xl">🧠</span>
                        <span className="font-bold text-[10px] uppercase">{isCoachMode ? 'ON' : 'Kouč'}</span>
                    </button>

                    <button 
                        onClick={onCenter}
                        data-testid="open-settings-btn"
                        className="bg-white/90 hover:bg-white p-3 rounded-xl shadow-lg transition-all active:scale-95 flex flex-col items-center gap-1 text-gray-600"
                    >
                        <span className="text-xl">⚙️</span>
                        <span className="font-bold text-[10px] uppercase">Menu</span>
                    </button>
                </div>
            </div>

            {/* Full Leaderboard Modal */}
            <AnimatePresence>
                {showLeaderboard && (
                    <LeaderboardFull onClose={() => setShowLeaderboard(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardScreen;

