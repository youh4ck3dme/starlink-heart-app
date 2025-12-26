import React from 'react';
import introBg from '../../assets/intro-bg.jpg';

interface IntroScreenProps {
    onStart: () => void;
    avatar: string; // Kept for compatibility but unused
    textColor: string; // Kept for compatibility but unused
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-black flex flex-col items-center justify-center">
            
            {/* Full Screen Image Button */}
            <button 
                onClick={onStart}
                className="absolute inset-0 w-full h-full p-0 border-none outline-none cursor-pointer group"
                aria-label="Start App - Tap anywhere"
            >
                {/* Background Image */}
                <img
                    src={introBg}
                    alt="Starlink Heart Welcome Screen"
                    className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                />
                
                {/* Overlay for interaction hint (optional) */}
                <span className="sr-only">Start</span>
            </button>
        </div>
    );
};

export default IntroScreen;
