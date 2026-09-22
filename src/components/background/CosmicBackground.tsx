import React from 'react';

// CSS-only implementation - no external images required
export type CosmicVariant = 'default' | 'luxury';

interface CosmicBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    variant?: CosmicVariant;
    intensity?: number;
    showComets?: boolean;
    animate?: boolean; 
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ 
    children, 
    className = '',
    variant = 'default',
}) => {
    return (
        <div 
            className={`relative min-h-dvh w-full overflow-hidden bg-[#02040a] text-white ${className}`}
        >
            {/* 1. Deep Space Base */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, #0b1226 0%, #02040a 100%)'
                }}
            />

            {/* 2. Animated Nebulas (Glassmorphism / Glow) */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                <div 
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(76, 29, 149, 0.3) 0%, transparent 70%)' }}
                />
                <div 
                    className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[100px]"
                    style={{ background: 'radial-gradient(circle, rgba(30, 64, 175, 0.2) 0%, transparent 70%)', animationDelay: '2s' }}
                />
            </div>

            {/* 3. CSS Starfield (Multi-layered for parallax feel) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)`,
                        backgroundSize: '80px 80px, 150px 150px',
                        backgroundPosition: '0 0, 40px 40px',
                    }}
                />
            </div>

            {/* 4. Content Container */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
            
            {/* 5. Vignette for focus */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>
    );
};

export default CosmicBackground;
