import { lazy, Suspense } from 'react';
import fallbackImage from "../../assets/avatars/starry.webp";

const RiveMascot = lazy(() => import("./RiveMascot"));
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
  // Shared fallback for Suspense and Image mode
  const Fallback = (
    <img
      className={className}
      src={fallbackImage}
      alt="Starry Avatar"
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
      loading="eager"
    />
  );

  // Mode: Static Image (fastest)
  if (mode === "image") {
    return Fallback;
  }

  const isSplineConfigured = splineScene && splineScene !== "PASTE_YOUR_SPLINE_URL_HERE";
  
  return (
    <Suspense fallback={Fallback}>
      {/* Mode: 3D Spline (only if configured) */}
      {mode === "spline3d" && isSplineConfigured ? (
        <Starry3D 
          className={className} 
          enabled={true} 
          scene={splineScene} 
        />
      ) : (
        /* Default: Rive animation (lightweight but lazy loaded now) */
        <RiveMascot className={className} />
      )}
    </Suspense>
  );
}
