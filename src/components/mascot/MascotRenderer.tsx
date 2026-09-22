import React, { lazy, Suspense, useCallback, useState } from 'react';
import starryImg from '../../assets/avatars/starry.png';
import cometImg from '../../assets/avatars/cometa.webp';
import robotImg from '../../assets/avatars/roboto.webp';
import RiveMascot from './RiveMascot';

const Starry3D = lazy(() => import('./Starry3D'));

export type MascotMode = 'image' | 'spline3d' | 'rive';

export const DEFAULT_RIVE_SRC = '/animations/starry.riv';

type MascotRendererProps = {
  mode?: MascotMode;
  className?: string;
  /** Spline scene URL for spline3d mode */
  splineScene?: string;
  /** Alias used by legacy fallback path */
  splineUrl?: string;
  /** Rive .riv asset path */
  riveSrc?: string;
  avatar?: string;
  gender?: 'boy' | 'girl' | 'unspecified';
  fallbackEmoji?: string;
  label?: string;
};

type MascotRendererState = {
  hasError: boolean;
};

class MascotErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback: React.ReactNode }>,
  MascotRendererState
> {
  state: MascotRendererState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Fallback UI handles display when rendering fails.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const resolveMascotImage = (avatar: string) => {
  if (avatar === '☄️') return cometImg;
  if (avatar === '🤖') return robotImg;
  return starryImg;
};

const MascotRenderer: React.FC<MascotRendererProps> = ({
  mode = 'image',
  className,
  splineScene = 'PASTE_YOUR_SPLINE_URL_HERE',
  splineUrl,
  riveSrc = DEFAULT_RIVE_SRC,
  avatar = '⭐',
  gender = 'unspecified',
  fallbackEmoji = '💙⭐',
  label = 'Starlink mascot',
}) => {
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);

  const mascotImage = resolveMascotImage(avatar);
  const imageFallback = (
    <img
      className={className}
      src={mascotImage}
      alt="Mascot Avatar"
      data-testid="mascot-image-fallback"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: gender === 'girl' ? 'hue-rotate(300deg)' : 'none',
      }}
      loading="eager"
    />
  );

  const emojiFallback = (
    <div
      className={className}
      role="img"
      aria-label={label}
      data-testid="mascot-fallback"
    >
      {fallbackEmoji}
    </div>
  );

  const fallback = avatar ? imageFallback : emojiFallback;

  if (hasError) {
    return fallback;
  }

  const effectiveSpline = splineUrl || splineScene;
  const isSplineConfigured =
    Boolean(effectiveSpline) && effectiveSpline !== 'PASTE_YOUR_SPLINE_URL_HERE';

  return (
    <MascotErrorBoundary fallback={fallback}>
      {mode === 'rive' ? (
        <RiveMascot
          src={riveSrc}
          fallbackEmoji={fallbackEmoji}
          label={label}
          className={className}
          onError={handleError}
          imageFallbackSrc={mascotImage}
        />
      ) : mode === 'spline3d' && isSplineConfigured ? (
        <Suspense fallback={fallback}>
          <Starry3D
            className={className}
            enabled={true}
            scene={effectiveSpline}
            onFallback={handleError}
          />
        </Suspense>
      ) : (
        fallback
      )}
    </MascotErrorBoundary>
  );
};

export default MascotRenderer;
