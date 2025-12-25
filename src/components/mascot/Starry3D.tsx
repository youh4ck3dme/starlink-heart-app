import { useState, useEffect, Suspense, lazy } from 'react';

const ReactSpline = lazy(() => import('@splinetool/react-spline'));

const SPLINE_SCENE_URL = "PASTE_YOUR_SPLINE_URL_HERE";
const STATIC_FALLBACK_IMG = "/assets/image.png"; // Using public path, assuming image is copied there or exists

interface Starry3DProps {
  className?: string;
}

export default function Starry3D({ className = "" }: Starry3DProps) {
  const [is3DEnabled, setIs3DEnabled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check user preference and system settings
  useEffect(() => {
    // 1. Check system reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    // 2. Check localStorage setting
    const storedSetting = localStorage.getItem('enable3DMascot');
    setIs3DEnabled(storedSetting === 'true');

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Determine if we should show 3D
  const shouldRender3D = is3DEnabled && !prefersReducedMotion && !hasError && SPLINE_SCENE_URL !== "PASTE_YOUR_SPLINE_URL_HERE";

  return (
    <div className={`relative ${className}`}>
      {shouldRender3D ? (
        <div className="w-full h-full relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-2" />
              <span className="text-xs text-indigo-500 font-medium">Načítavam Starry...</span>
            </div>
          )}
          
          <Suspense fallback={null}>
            <ReactSpline 
              scene={SPLINE_SCENE_URL}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </Suspense>
        </div>
      ) : (
        <img 
          src={STATIC_FALLBACK_IMG} 
          alt="Prof. StarLink" 
          className="w-full h-full object-contain drop-shadow-xl"
          onError={(e) => {
            // Fallback if image fails - try relative path
            (e.target as HTMLImageElement).src = new URL('../../assets/image.png', import.meta.url).href;
          }}
        />
      )}
    </div>
  );
}
