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

            {/* Bubble removed - text moved to main avatar area */}
        </div>
    );
};

export default StarryHelper;
