import React, { useState, useEffect } from 'react';
import cosmicBg from '../../assets/cosmic.webp';

interface CosmicBackgroundProps {
    children?: React.ReactNode;
    className?: string;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ children, className = '' }) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (prefersReducedMotion) return;
        
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const x = (clientX / innerWidth - 0.5) * 2;
        const y = (clientY / innerHeight - 0.5) * 2;
        
        setOffset({ x: x * 10, y: y * 10 });
    };

    useEffect(() => {
        if (prefersReducedMotion) return;
        
        let isActive = true;
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (!isActive || !e.gamma || !e.beta) return;
            const x = Math.min(Math.max(e.gamma, -45), 45) / 45;
            const y = Math.min(Math.max(e.beta - 45, -45), 45) / 45;
            setOffset({ x: x * 10, y: y * 10 });
        };

        if (window.isSecureContext && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        }
        
        return () => {
            isActive = false;
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [prefersReducedMotion]);

    return (
        <div 
            className={`relative min-h-dvh w-full overflow-hidden bg-black text-white ${className}`}
            onPointerMove={handlePointerMove}
        >
            {/* Background Image with Parallax */}
            <div 
                className="absolute inset-0 transition-transform duration-100 ease-out will-change-transform"
                style={{ 
                    transform: prefersReducedMotion 
                        ? 'none' 
                        : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.05)` 
                }}
            >
                <img 
                    src={cosmicBg} 
                    alt="Cosmic Background" 
                    className="w-full h-full object-cover"
                    loading="eager"
                />
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-20 w-full h-full">
                {children}
            </div>
        </div>
    );
};
