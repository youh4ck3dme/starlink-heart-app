import React from 'react';

const StarryAvatarDisplay = ({ 
    avatar, 
    isThinking = false, 
    isExcited = false, 
    size = "text-3xl" 
}: { 
    avatar: string; 
    isThinking?: boolean; 
    isExcited?: boolean; 
    size?: string; 
}) => {
    return (
        <div className={`relative flex items-center justify-center ${size} transition-all duration-300`}>
            <div className={`relative z-10 transition-transform duration-500 ${isExcited ? 'scale-125 rotate-[360deg]' : 'scale-100'} ${isThinking ? 'animate-bounce' : ''}`}>
                {avatar}
            </div>
            {isThinking && (
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                 </span>
            )}
        </div>
    );
};

export default StarryAvatarDisplay;
