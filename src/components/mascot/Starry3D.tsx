import { useEffect, useState } from "react";
import fallbackImage from "../../assets/avatars/starry.webp";

type Props = {
  enabled: boolean;
  scene: string;
  className?: string;
  onFallback?: () => void;
};

export default function Starry3D({ enabled, scene, className, onFallback }: Props) {
  const [Spline, setSpline] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    
    // Don't load if scene is placeholder
    if (scene === "PASTE_YOUR_SPLINE_URL_HERE" || !scene) {
      if (onFallback) onFallback();
      return;
    }
    
    let cancelled = false;
    setIsLoading(true);

    import("@splinetool/react-spline")
      .then((mod) => {
        if (cancelled) return;
        setSpline(() => mod.default);
        setIsLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Zlyhalo načítanie 3D");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, scene]);

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
      <div className={`${className} flex flex-col items-center justify-center`}>
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
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Spline scene={scene} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
