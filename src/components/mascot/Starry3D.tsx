import { useEffect, useRef, useState } from 'react';
import fallbackImage from '../../assets/avatars/starry.png';

type Props = {
  enabled: boolean;
  scene: string;
  className?: string;
  onFallback?: () => void;
  loadTimeoutMs?: number;
};

export default function Starry3D({
  enabled,
  scene,
  className,
  onFallback,
  loadTimeoutMs = 10000,
}: Props) {
  const [Spline, setSpline] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const onFallbackRef = useRef(onFallback);

  useEffect(() => {
    onFallbackRef.current = onFallback;
  }, [onFallback]);

  useEffect(() => {
    if (!enabled) return;

    // Don't load if scene is placeholder
    if (scene === 'PASTE_YOUR_SPLINE_URL_HERE' || !scene) {
      onFallbackRef.current?.();
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setError('3D scéna sa nenačítala včas');
        setIsLoading(false);
        onFallbackRef.current?.();
      }
    }, loadTimeoutMs);

    import('@splinetool/react-spline')
      .then((mod) => {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setSpline(() => mod.default);
        setIsLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setError(e instanceof Error ? e.message : 'Zlyhalo načítanie 3D');
        setIsLoading(false);
        onFallbackRef.current?.();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, scene, loadTimeoutMs]);

  // Not enabled - return null (MascotRenderer will handle fallback)
  if (!enabled) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className} flex flex-col items-center justify-center`}>
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-2" />
        <span className="text-xs text-indigo-500 font-medium">Načítavam 3D (~4 MB)...</span>
      </div>
    );
  }

  // Error state - show fallback image
  if (error) {
    return (
      <div className={`${className} flex flex-col items-center justify-center`} data-testid="starry3d-fallback">
        <img
          src={fallbackImage}
          alt="Starry"
          className="w-full h-full object-contain opacity-50"
        />
        <span className="text-xs text-red-400 mt-2">{error}</span>
      </div>
    );
  }

  // Spline not loaded yet
  if (!Spline) return null;

  return (
    <div className={className} style={{ width: '100%', height: '100%' }} data-testid="starry-3d">
      <Spline
        scene={scene}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => {
          /* scene ready */
        }}
        onError={() => {
          setError('Spline scéna zlyhala');
          onFallbackRef.current?.();
        }}
      />
    </div>
  );
}
