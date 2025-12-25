import React, { useState } from 'react';

type SplineMascotProps = {
  url?: string;
  fallbackEmoji?: string;
  label?: string;
  className?: string;
  onError?: () => void;
};

const SplineMascot: React.FC<SplineMascotProps> = ({
  url,
  fallbackEmoji = '💙⭐',
  label = 'Starlink mascot',
  className,
  onError,
}) => {
  const [hasError, setHasError] = useState(!url);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError || !url) {
    return (
      <div
        className={className}
        role="img"
        aria-label={label}
        data-testid="spline-fallback"
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <iframe
      title={label}
      src={url}
      className={className}
      onError={handleError}
      data-testid="spline-frame"
    />
  );
};

export default SplineMascot;
