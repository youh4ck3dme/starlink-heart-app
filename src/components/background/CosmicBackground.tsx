import React, { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { StarTwinkle } from '../effects/StarTwinkle';

export type CosmicVariant = 'mirrorNebula' | 'portalStarforge';

interface Props {
  variant?: CosmicVariant;
  intensity?: number; // 0..1 – sila efektov
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * GPU-friendly parallax pozadie. Nepoužíva ťažké filtre; animujeme len transform/opacity.
 */
export default function CosmicBackground({
  variant = 'mirrorNebula',
  intensity = 0.8,
  animate = true,
  className,
  children,
}: Props) {
  const prefersReduce = useReducedMotion();
  const safeAnimate = animate && !prefersReduce;

  // ✨ LUXURY GLASS EFFECT - Premium holographic shimmer
  const glassGradient = useMemo(
    () =>
      `radial-gradient(ellipse 800px 300px at 30% 20%, rgba(139,92,246,${0.15 * intensity}) 0%, transparent 50%),
       radial-gradient(ellipse 600px 200px at 70% 80%, rgba(236,72,153,${0.12 * intensity}) 0%, transparent 50%),
       linear-gradient(135deg, rgba(255,255,255,${0.08 * intensity}) 0%, transparent 30%, rgba(255,255,255,${0.05 * intensity}) 50%, transparent 70%, rgba(255,255,255,${0.08 * intensity}) 100%)`,
    [intensity]
  );

  // 🌌 LUXURY NEBULA - Deep space with vibrant aurora colors
  const nebulaGradient = useMemo(
    () =>
      `radial-gradient(ellipse 120% 80% at 20% 20%, rgba(139,92,246,${0.35 * intensity}) 0%, transparent 50%),
       radial-gradient(ellipse 100% 60% at 80% 30%, rgba(59,130,246,${0.30 * intensity}) 0%, transparent 50%),
       radial-gradient(ellipse 80% 50% at 60% 80%, rgba(236,72,153,${0.25 * intensity}) 0%, transparent 50%),
       radial-gradient(ellipse 60% 40% at 30% 70%, rgba(16,185,129,${0.20 * intensity}) 0%, transparent 50%),
       radial-gradient(ellipse 150% 100% at 50% 100%, rgba(251,191,36,${0.15 * intensity}) 0%, transparent 40%),
       linear-gradient(180deg, #0c0015 0%, #0a0020 30%, #050012 70%, #020008 100%)`,
    [intensity]
  );

  // kométy – zriedkavé, CPU-lite
  const cometRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!safeAnimate || !cometRef.current) return;
    const el = cometRef.current;
    let timer: number | null = null;
    const spawn = () => {
      el.style.opacity = '1';
      el.animate(
        [
          { transform: 'translate3d(-20vw,-20vh,0) rotate(15deg)', opacity: 0 },
          { transform: 'translate3d(40vw,40vh,0) rotate(15deg)', opacity: 1 },
          { transform: 'translate3d(60vw,60vh,0) rotate(15deg)', opacity: 0 },
        ],
        { duration: 4000, easing: 'ease', iterations: 1 }
      );
      timer = window.setTimeout(spawn, 7000 + Math.random() * 6000);
    };
    timer = window.setTimeout(spawn, 2000);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [safeAnimate]);

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} aria-hidden>
      {/* Layer 0: Base nebula gradient with subtle pulse */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: nebulaGradient }}
        initial={{ opacity: 0.6, scale: 1 }}
        animate={safeAnimate ? { 
          opacity: [0.7, 0.9, 0.7], 
          scale: [1, 1.02, 1] 
        } : undefined}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
      />

      {/* Layer 0.5: Aurora wave effect */}
      <motion.div
        className="absolute inset-0 z-[0] pointer-events-none"
        style={{
          background: `linear-gradient(45deg, 
            transparent 0%, 
            rgba(139,92,246,0.1) 25%, 
            rgba(59,130,246,0.15) 50%, 
            rgba(236,72,153,0.1) 75%, 
            transparent 100%)`,
          backgroundSize: '400% 400%',
        }}
        initial={{ backgroundPosition: '0% 50%' }}
        animate={safeAnimate ? { 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
        } : undefined}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
      />

      {/* Layer 1: Mirror glass effect with shimmer */}
      <motion.div
        className="absolute inset-0 z-[1] mix-blend-screen pointer-events-none"
        style={{ backgroundImage: glassGradient }}
        initial={{ opacity: 0 }}
        animate={safeAnimate ? { opacity: [0.6, 1, 0.6] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Layer 2: Star particles */}
      <div className="absolute inset-0 z-[2] opacity-90">
         <StarTwinkle className="w-full h-full" />
      </div>

      {/* Layer 3: LUXURY Rainbow Comet */}
      <div
        ref={cometRef}
        className="absolute top-0 left-0 z-[3] w-80 h-1.5 rounded-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.8) 20%, rgba(59,130,246,1) 40%, rgba(16,185,129,1) 60%, rgba(251,191,36,0.8) 80%, transparent 100%)',
          boxShadow: '0 0 30px 10px rgba(139,92,246,.5), 0 0 60px 20px rgba(59,130,246,.3)',
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      />

      {/* Layer 10: Content (always on top) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
