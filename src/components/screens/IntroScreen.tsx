import React from 'react';
import StarryAvatarDisplay from '../common/StarryAvatarDisplay';

interface IntroScreenProps {
    onStart: () => void;
    avatar: string;
    textColor: string;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, avatar, textColor }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full animate-fade-in-up text-center p-6 relative overflow-hidden">
            
            {/* Main Content Container - Centered */}
            <div className="flex flex-col items-center max-w-lg w-full z-10">
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                    <StarryAvatarDisplay avatar={avatar} isExcited={true} size="text-[7rem] md:text-[9rem]" />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-sky-400 via-blue-500 to-purple-500 mb-2 drop-shadow-sm font-display tracking-tight leading-tight">
                    Starlink Heart
                </h1>
                
                <p className={`text-lg md:text-2xl mb-10 max-w-md leading-relaxed ${textColor} font-medium opacity-90`}>
                    Tvoj osobný vesmírny sprievodca.
                </p>

                {/* Features Grid - Clean & Glassmorphic */}
                <div className="grid grid-cols-3 gap-4 w-full mb-12 px-4">
                    {[
                        { icon: "🤖", title: "AI Kamarát", desc: "Vždy pomôže" },
                        { icon: "💎", title: "Zbieraj XP", desc: "Hraj a rasti" },
                        { icon: "🎨", title: "Tvoj Štýl", desc: "Prispôsob si" }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center transition-all hover:scale-105 duration-300 hover:bg-white/10 shadow-lg">
                            <span className="text-3xl mb-2 filter drop-shadow-md">{feature.icon}</span>
                            <span className={`font-bold text-sm ${textColor} tracking-wide`}>{feature.title}</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={onStart}
                    className="group relative w-full md:w-auto min-w-[280px] px-8 py-6 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-[0_0_40px_rgba(250,204,21,0.6)] border border-yellow-200 transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(250,204,21,0.8)] active:scale-95"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
                    <span className="relative flex items-center justify-center gap-3">
                        <span className="text-3xl font-black text-yellow-900 tracking-wider">ŠTART</span>
                        <span className="text-3xl animate-pulse">🚀</span>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default IntroScreen;
