import { lazy, Suspense } from "react";
import RiveMascot from "./RiveMascot";
import fallbackImage from '../../assets/welcome-hero.png';

// Lazy load Starry3D - this ensures @splinetool is NOT bundled until user requests 3D mode
const Starry3D = lazy(() => import("./Starry3D"));

export type MascotMode = "image" | "rive" | "spline3d";

type Props = {
  mode: MascotMode;
  className?: string;
  /** pre spline3d */
  splineScene?: string;
};

export default function MascotRenderer({
  mode,
  className,
  splineScene = "PASTE_YOUR_SPLINE_URL_HERE",
}: Props) {
  // Mode: Static Image (fastest)
  if (mode === "image") {
    return (
      <img
        className={className}
        src={fallbackImage}
        alt="Starry"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        loading="eager"
      />
    );
  }



  const isSplineConfigured = splineScene && splineScene !== "PASTE_YOUR_SPLINE_URL_HERE";
  
  // Mode: 3D Spline (only if configured)
  if (mode === "spline3d" && isSplineConfigured) {
    return (
      <Suspense fallback={
        <div className={`${className} flex items-center justify-center`}>
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      }>
        <Starry3D 
          className={className} 
          enabled={true} 
          scene={splineScene} 
        />
      </Suspense>
    );
  }

  // Default: Rive animation (lightweight)
  return <RiveMascot className={className} />;
}
