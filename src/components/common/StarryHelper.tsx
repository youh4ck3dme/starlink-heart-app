import React, { useState } from 'react';
import StarryAvatarDisplay from './StarryAvatarDisplay';

const StarryHelper = ({ avatar = '⭐' }: { avatar?: string }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-40 flex items-end animate-fade-in-up">
            {/* Avatar */}
            <div className="relative group cursor-pointer" onClick={() => setIsVisible(false)}>
                <StarryAvatarDisplay avatar={avatar} size="text-5xl" isFloating={true} />
            </div>

            {/* Bubble */}
            <div className="ml-3 mb-2 max-w-[200px] md:max-w-xs bg-white/90 backdrop-blur-md p-3 rounded-2xl rounded-bl-none shadow-lg border border-sky-100 text-sm text-gray-700 relative">
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-0.5 shadow-sm border border-gray-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <p className="font-semibold text-sky-600 mb-1">Ahoj! 👋</p>
                <p>Klikni na <span className="font-bold">"Nová Misia"</span> a opýtaj sa ma čokoľvek o vesmíre! Alebo si urob fotku a ja ti poviem, čo na nej je. 📸✨</p>
            </div>
        </div>
    );
};

export default StarryHelper;
