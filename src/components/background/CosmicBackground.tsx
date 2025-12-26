import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
// Original static asset
import cosmicBg from '../../assets/cosmic.webp';

// Import our luxury layers (kept in reserve as requested)
import layerBase from '../../assets/layers/layer_a_base_nebula.webp';
import layerStars from '../../assets/layers/layer_b_starfield.webp';
import layerGlass from '../../assets/layers/layer_c_glass.webp';
import layerComets from '../../assets/layers/layer_d_comets.webp';

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
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    
    // Parallax State (Only used in luxury mode)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 40, damping: 30, mass: 0.8 });
    const springY = useSpring(mouseY, { stiffness: 40, damping: 30, mass: 0.8 });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (prefersReducedMotion || variant !== 'luxury') return;
        
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 2;
        const y = (clientY / innerHeight - 0.5) * 2;
        
        mouseX.set(x);
        mouseY.set(y);
    };

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
                        src={cosmicBg} 
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

    // --- RENDER LUXURY (LAYERED) ---
    // Transforms for parallax
    const xStars = useTransform(springX, [-1, 1], [20 * intensity, -20 * intensity]);
    const yStars = useTransform(springY, [-1, 1], [20 * intensity, -20 * intensity]);
    const xGlass = useTransform(springX, [-1, 1], [-15 * intensity, 15 * intensity]);
    const yGlass = useTransform(springY, [-1, 1], [-15 * intensity, 15 * intensity]);
    const xComets = useTransform(springX, [-1, 1], [-40 * intensity, 40 * intensity]);
    const yComets = useTransform(springY, [-1, 1], [-40 * intensity, 40 * intensity]);

    return (
        <div 
            className={`relative min-h-dvh w-full overflow-hidden bg-[#060819] text-white ${className}`}
            onPointerMove={handlePointerMove}
        >
            {/* LAYER A: BASE NEBULA */}
            <div className="absolute inset-0">
                <img src={layerBase} alt="" className="w-full h-full object-cover opacity-90" />
            </div>

            {/* LAYER B: STARFIELD */}
            <motion.div className="absolute inset-0" style={{ x: xStars, y: yStars, opacity: 0.8 }}>
                <img src={layerStars} alt="" className="w-full h-full object-cover" />
            </motion.div>

            {/* LAYER C: GLASS STREAKS */}
            <motion.div className="absolute inset-0 mix-blend-screen" style={{ x: xGlass, y: yGlass, opacity: 0.4 }}>
                <img src={layerGlass} alt="" className="w-full h-full object-cover" />
            </motion.div>

            {/* LAYER D: FOREGROUND ELEMENTS */}
            {!prefersReducedMotion && showComets && (
                <motion.div className="absolute inset-0 pointer-events-none" style={{ x: xComets, y: yComets }}>
                    <img src={layerComets} alt="" className="w-full h-full object-cover opacity-90" />
                </motion.div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#060819] via-transparent to-transparent opacity-80 pointer-events-none" />
            
            <div className="relative z-20 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default CosmicBackground;
