import React, { useEffect, useState } from 'react';

type RiveMascotProps = {
  src?: string;
  fallbackEmoji?: string;
  label?: string;
  className?: string;
  onError?: () => void;
};

const RiveMascotNew: React.FC<RiveMascotProps> = ({
  src,
  fallbackEmoji = '💙⭐',
  label = 'Starlink mascot',
  className,
  onError,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    let isActive = true;

    if (!src) {
      setStatus('error');
      onError?.();
      return undefined;
    }

    setStatus('loading');
    fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Rive asset: ${response.status}`);
        }
        if (isActive) {
          setStatus('ready');
        }
      })
      .catch(() => {
        if (isActive) {
          setStatus('error');
          onError?.();
        }
      });

    return () => {
      isActive = false;
    };
  }, [onError, src]);

  if (status === 'error' || status === 'idle') {
    return (
      <div
        className={className}
        role="img"
        aria-label={label}
        data-testid="rive-fallback"
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className ?? ''}`}>
      <canvas
        className="h-full w-full"
        aria-label={label}
        data-testid="rive-canvas"
      />
      <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        {fallbackEmoji}
      </span>
    </div>
  );
};

export default RiveMascotNew;
