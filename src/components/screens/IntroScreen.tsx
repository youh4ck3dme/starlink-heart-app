import React from 'react';
import StarryAvatarDisplay from '../common/StarryAvatarDisplay';

interface IntroScreenProps {
    onStart: () => void;
    avatar: string;
    textColor: string;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, avatar, textColor }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in-up text-center p-6 pb-20">
            <div className="mb-8">
                <StarryAvatarDisplay avatar={avatar} isExcited={true} size="text-[8rem]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-sky-400 via-blue-500 to-purple-500 mb-4 drop-shadow-sm font-display tracking-tight">
                Starlink Heart
            </h1>
            <p className={`text-lg md:text-xl mb-12 max-w-md leading-relaxed ${textColor} opacity-80`}>
                Tvoj osobný vesmírny sprievodca.
            </p>
            <button 
                onClick={onStart}
                className="group relative px-12 py-5 bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 rounded-[2rem] shadow-[0_10px_20px_rgba(234,179,8,0.4)] border-b-[6px] border-yellow-700 active:border-b-0 active:translate-y-[6px] transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-[2rem] pointer-events-none"></div>
                <span className="relative text-2xl font-black text-yellow-900 tracking-wider flex items-center gap-2 drop-shadow-sm">
                    ŠTART <span className="text-3xl group-hover:translate-x-1 transition-transform">🚀</span>
                </span>
            </button>
        </div>
    );
};

export default IntroScreen;
