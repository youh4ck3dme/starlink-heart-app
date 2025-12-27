import { lazy, Suspense } from 'react';
import starryImg from "../../assets/avatars/starry.webp";
import cometImg from "../../assets/avatars/cometa.webp";
import robotImg from "../../assets/avatars/roboto.webp";

const Starry3D = lazy(() => import("./Starry3D"));

export type MascotMode = "image" | "spline3d";

type Props = {
  mode: MascotMode;
  className?: string;
  /** pre spline3d */
  splineScene?: string;
  avatar?: string;
  gender?: 'boy' | 'girl' | 'unspecified';
};

export default function MascotRenderer({
  mode,
  className,
  splineScene = "PASTE_YOUR_SPLINE_URL_HERE",
  avatar = "⭐",
  gender = 'unspecified'
}: Props) {
  // Determine which image to show based on the avatar emoji/string
  let mascotImage = starryImg;
  if (avatar === '☄️') mascotImage = cometImg;
  if (avatar === '🤖') mascotImage = robotImg;

  // Shared fallback for Suspense and Image mode
  const Fallback = (
    <img
      className={className}
      src={mascotImage}
      alt="Mascot Avatar"
      style={{ 
        width: "100%", 
        height: "100%", 
        objectFit: "contain",
        filter: gender === 'girl' ? 'hue-rotate(300deg)' : 'none'
      }}
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
        /* Default fallback if 3D not configured */
        Fallback
      )}
    </Suspense>
  );
}
