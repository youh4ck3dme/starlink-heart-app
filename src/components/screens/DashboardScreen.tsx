import React from 'react';
import StarryAvatarDisplay from '../common/StarryAvatarDisplay';
import MascotRenderer, { MascotMode } from '../mascot/MascotRenderer';

interface DashboardScreenProps {
    onNewMission: () => void;
    onProfile: () => void;
    onCenter: () => void;
    onCoachToggle: () => void;
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
    isCoachMode, 
    avatar, 
    gems,
    textColor,
    mascotMode
}) => {
    return (
        <div className="flex flex-col h-full animate-fade-in-up p-6 overflow-y-auto">
            {/* Top Bar for Dashboard */}
            <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg">
                    <span className="text-2xl">{avatar}</span>
                    <span className={`font-bold ${textColor}`}>Kadet</span>
                 </div>
                 
                 {/* Compact Avatar Display - shows selected avatar */}
                 <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-gradient-to-b from-indigo-500/30 to-purple-600/30 backdrop-blur-md flex items-center justify-center">
                    <span className="text-2xl">{avatar}</span>
                 </div>

                 <div className="flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
                    <span className="text-xl">💎</span>
                    <span className={`font-bold ${textColor === 'text-white' ? 'text-yellow-200' : 'text-yellow-700'}`}>{gems}</span>
                 </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-10">
                <div className="relative mb-4">
                    <StarryAvatarDisplay avatar={avatar} isThinking={false} size="text-[6rem]" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 whitespace-nowrap">
                        <span className={`text-sm font-medium ${textColor}`}>Systémy online...</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {/* Card 1: New Mission */}
                    <button onClick={onNewMission} data-testid="new-mission-btn" className="group relative aspect-square bg-gradient-to-b from-sky-400 to-blue-600 rounded-3xl p-4 shadow-xl border-b-[8px] border-blue-800 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform relative z-10">🚀</span>
                        <span className="text-white font-black text-xl leading-tight uppercase tracking-wide drop-shadow-md relative z-10">Nová<br/>Misia</span>
                    </button>

                    {/* Card 2: My Profile */}
                    <button onClick={onProfile} data-testid="profile-btn" className="group relative aspect-square bg-gradient-to-b from-amber-300 to-orange-500 rounded-3xl p-4 shadow-xl border-b-[8px] border-orange-700 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform relative z-10">🎒</span>
                        <span className="text-white font-black text-xl leading-tight uppercase tracking-wide drop-shadow-md relative z-10">Môj<br/>Profil</span>
                    </button>

                    {/* Card 3: Centrum (Settings) */}
                    <button onClick={onCenter} data-testid="settings-btn" className="group relative aspect-square bg-gradient-to-b from-emerald-400 to-teal-600 rounded-3xl p-4 shadow-xl border-b-[8px] border-teal-800 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
                        <span className="text-5xl drop-shadow-md group-hover:rotate-45 transition-transform relative z-10">⚙️</span>
                        <span className="text-white font-black text-xl leading-tight uppercase tracking-wide drop-shadow-md relative z-10">Centrum</span>
                    </button>

                    {/* Card 4: Coach Mode Toggle */}
                    <button onClick={onCoachToggle} data-testid="coach-toggle-btn" className={`group relative aspect-square bg-gradient-to-b ${isCoachMode ? 'from-fuchsia-400 to-purple-600 border-purple-800' : 'from-gray-300 to-gray-500 border-gray-600'} rounded-3xl p-4 shadow-xl border-b-[8px] active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden`}>
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform relative z-10">
                            {isCoachMode ? '🎓' : '🎮'}
                        </span>
                        <span className="text-white font-black text-xl leading-tight uppercase tracking-wide drop-shadow-md relative z-10">
                            {isCoachMode ? 'Kouč' : 'Hra'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
