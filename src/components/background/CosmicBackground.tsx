import React from 'react';

// Import remaining layers
import layerBase from '../../assets/layers/layer_a_base_nebula.webp';
import layerStars from '../../assets/layers/layer_b_starfield.webp';

export type CosmicVariant = 'default' | 'luxury';

interface CosmicBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    variant?: CosmicVariant;
    intensity?: number;
    showComets?: boolean;
    // Keeping 'animate' in props to prevent build errors from legacy usage, though unused
    animate?: boolean; 
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ 
    children, 
    className = '',
    variant = 'default',
    intensity = 1,
    showComets = true
}) => {

    // --- RENDER DEFAULT (STATIC) ---
    if (variant === 'default') {
        return (
            <div 
                className={`relative min-h-dvh w-full overflow-hidden bg-black text-white ${className}`}
                aria-hidden="true"
            >
                {/* Single Static Image Layer (Safe & Basic) */}
                <div className="absolute inset-0">
                    <img 
                        src={layerStars} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-80"
                    />
                </div>
                {/* Simple Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                
                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </div>
        );
    }

    // --- RENDER LUXURY (RANDOM SINGLE LAYER MODE) ---
    // User Request: "vsetky naraz vypnu a budu sa po kazdom resfreshi menit 1 vrstva len"
    const randomLayer = React.useMemo(() => {
        // Removed: cosmicBg (black), layerGlass (glow), layerComets (asteroid/earth)
        const layers = [layerBase, layerStars];
        return layers[Math.floor(Math.random() * layers.length)];
    }, []);

    return (
        <div 
            className={`relative min-h-dvh w-full overflow-hidden bg-black text-white ${className}`}
        >
            <div className="absolute inset-0">
                <img 
                    src={randomLayer} 
                    alt="Random Cosmic Layer" 
                    className="w-full h-full object-cover opacity-90 transition-opacity duration-1000 ease-in-out" 
                />
            </div>
            
            {/* Subtle overlay to ensure text readability regardless of layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
            
            <div className="relative z-20 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default CosmicBackground;
