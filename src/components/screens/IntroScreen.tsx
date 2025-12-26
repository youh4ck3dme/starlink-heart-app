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
                <div className="grid grid-cols-3 gap-3 w-full mb-10">
                    {[
                        { icon: "🤖", title: "AI Kamarát", desc: "Vždy pomôže" },
                        { icon: "💎", title: "Zbieraj XP", desc: "Hraj a rasti" },
                        { icon: "🎨", title: "Tvoj Štýl", desc: "Prispôsob si" }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex flex-col items-center transition-transform hover:scale-105 duration-300">
                            <span className="text-2xl mb-1">{feature.icon}</span>
                            <span className={`font-bold text-sm ${textColor}`}>{feature.title}</span>
                            <span className={`text-[10px] opacity-70 ${textColor}`}>{feature.desc}</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={onStart}
                    className="group relative px-12 py-5 bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 rounded-[2rem] shadow-[0_10px_30px_rgba(234,179,8,0.5)] border-b-[6px] border-yellow-700 active:border-b-0 active:translate-y-[6px] transition-all w-full md:w-auto"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-[2rem] pointer-events-none"></div>
                    <span className="relative text-2xl md:text-3xl font-black text-yellow-900 tracking-wider flex items-center justify-center gap-3 drop-shadow-sm">
                        ŠTART <span className="text-4xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">🚀</span>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default IntroScreen;
