import React, { useRef, useState, useEffect } from 'react';
import starryVideo from './starry.mp4';

interface IntroScreenProps {
    onStart: () => void;
    avatar: string; // Kept for compatibility but unused
    textColor: string; // Kept for compatibility but unused
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoEnded, setIsVideoEnded] = useState(false);

    const handleVideoEnd = () => {
        setIsVideoEnded(true);
        if (videoRef.current) {
            videoRef.current.pause(); // Ensure it stops
        }
    };

    // Fallback: If video takes too long to load or fails, show button after 5s?
    // Or just let it be.

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-black flex flex-col items-center justify-center">
            
            {/* Video Background */}
            <video
                ref={videoRef}
                src={starryVideo}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                loop={false}
                onEnded={handleVideoEnd}
            />

            {/* Start Button - Appears only after video ends */}
            <div 
                className={`relative z-20 transition-all duration-1000 ease-out transform ${
                    isVideoEnded 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
                }`}
            >
                <button 
                    onClick={onStart}
                    className="group relative w-full md:w-auto min-w-[280px] px-8 py-6 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.3)] border border-yellow-200 transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] active:scale-95 neon-snake-border"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
                    <span className="relative flex items-center justify-center gap-3">
                        <span className="text-3xl font-black text-yellow-900 tracking-wider">ŠTART</span>
                        <span className="text-3xl animate-pulse">🚀</span>
                    </span>
                </button>
            </div>

            {/* Optional "Skip" hint if needed, usually hidden for immersive intro */}
        </div>
    );
};

export default IntroScreen;
