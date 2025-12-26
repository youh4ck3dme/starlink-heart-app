import starApng from '../../assets/star_bounce256.apng';
import cometImg from '../../assets/avatars/cometa_3d.png';
import roboImg from '../../assets/avatars/robo_3d.png';

const StarryAvatarDisplay = ({ 
    avatar, 
    isThinking = false, 
    isExcited = false, 
    isFloating = false,
    size = "text-3xl" 
}: { 
    avatar: string; 
    isThinking?: boolean; 
    isExcited?: boolean; 
    isFloating?: boolean;
    size?: string; 
}) => {
    // If avatar is one of the new 3D avatars, render the image
    const isImageAvatar = ['⭐', '☄️', '🤖'].includes(avatar); 
    
    let avatarImageSrc = '';
    // Use the animated APNG for Starry!
    if (avatar === '⭐') avatarImageSrc = starApng;
    else if (avatar === '☄️') avatarImageSrc = cometImg;
    else if (avatar === '🤖') avatarImageSrc = roboImg;

    // Calculate pixel size based on text size class for image
    const pixelSize = size.includes('text-[') ? size.match(/text-\[(.*?)\]/)?.[1] : 
                      size === 'text-6xl' ? '60px' : 
                      size === 'text-[8rem]' || size === 'text-[7rem]' || size === 'text-[9rem]' ? '128px' : '32px';
                      
    // Disable CSS bounce for Starry because the APNG itself is bouncing
    const shouldAnimateCss = (isThinking || isFloating) && avatar !== '⭐';

    return (
        <div className={`relative flex items-center justify-center ${size} transition-all duration-300`}>
            <div className={`relative z-10 transition-transform duration-500 ${isExcited ? 'scale-125 rotate-[360deg]' : 'scale-100'} ${shouldAnimateCss ? 'animate-bounce' : ''}`}>
                {isImageAvatar ? (
                    <img 
                        src={avatarImageSrc}
                        alt={avatar === '⭐' ? "Starry Mascot" : "Avatar"} 
                        className="object-contain drop-shadow-lg"
                        style={{ width: pixelSize, height: pixelSize }}
                    />
                ) : (
                    avatar
                )}
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
