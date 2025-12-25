import React, { useState } from 'react';
import RiveMascot from './RiveMascot';
import SplineMascot from './SplineMascot';

type MascotRendererProps = {
  riveSrc?: string;
  splineUrl?: string;
  fallbackEmoji?: string;
  label?: string;
  className?: string;
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
    // Intentionally blank: fallback handles display when rendering fails.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const MascotRenderer: React.FC<MascotRendererProps> = ({
  riveSrc,
  splineUrl,
  fallbackEmoji = '💙⭐',
  label = 'Starlink mascot',
  className,
}) => {
  const [hasError, setHasError] = useState(false);
  const fallback = (
    <div
      className={className}
      role="img"
      aria-label={label}
      data-testid="mascot-fallback"
    >
      {fallbackEmoji}
    </div>
  );

  if (hasError) {
    return fallback;
  }

  return (
    <MascotErrorBoundary fallback={fallback}>
      {riveSrc ? (
        <RiveMascot
          src={riveSrc}
          fallbackEmoji={fallbackEmoji}
          label={label}
          className={className}
          onError={() => setHasError(true)}
        />
      ) : splineUrl ? (
        <SplineMascot
          url={splineUrl}
          fallbackEmoji={fallbackEmoji}
          label={label}
          className={className}
          onError={() => setHasError(true)}
        />
      ) : (
        fallback
      )}
    </MascotErrorBoundary>
  );
};

export default MascotRenderer;
