import React, { useEffect } from 'react';

interface LevelUpModalProps {
    level: number;
    title: string;
    onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, title, onClose }) => {
    
    // Auto-close after 5 seconds
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            {/* CSS Confetti/Particles can be added here */}
            
            <div className="bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 p-1 rounded-[2.5rem] shadow-2xl animate-pop-in transform transition-all hover:scale-105 duration-500">
                <div className="bg-gray-900 rounded-[2.4rem] px-12 py-12 text-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="text-8xl mb-6 animate-bounce drop-shadow-lg">🎉</div>
                        
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-4 tracking-tight drop-shadow-sm">
                            LEVEL UP!
                        </h2>
                        
                        <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 mb-2 border border-white/10">
                            <p className="text-4xl font-bold text-white mb-1">Úroveň {level}</p>
                            <p className="text-lg text-orange-200 font-medium tracking-wide uppercase">{title}</p>
                        </div>
                        
                        <p className="text-gray-400 mt-8 text-sm">Pokračuj v misii, kadet!</p>
                        
                         <button 
                            onClick={onClose}
                            className="mt-8 bg-white text-orange-600 font-bold py-3 px-10 rounded-full hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
                        >
                            Pokračovať
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
