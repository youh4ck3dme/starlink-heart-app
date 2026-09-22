import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';

type RiveMascotProps = {
  src?: string;
  fallbackEmoji?: string;
  label?: string;
  className?: string;
  onError?: () => void;
  /** Optional image shown while loading / as richer fallback */
  imageFallbackSrc?: string;
};

const FallbackView: React.FC<{
  className?: string;
  label: string;
  fallbackEmoji: string;
  imageFallbackSrc?: string;
}> = ({ className, label, fallbackEmoji, imageFallbackSrc }) =>
  imageFallbackSrc ? (
    <img
      className={className}
      src={imageFallbackSrc}
      alt={label}
      data-testid="rive-fallback"
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  ) : (
    <div
      className={className}
      role="img"
      aria-label={label}
      data-testid="rive-fallback"
    >
      {fallbackEmoji}
    </div>
  );

type RiveRuntimeProps = {
  src: string;
  fallbackEmoji: string;
  label: string;
  className?: string;
  imageFallbackSrc?: string;
  onError: () => void;
};

const RiveRuntime: React.FC<RiveRuntimeProps> = ({
  src,
  fallbackEmoji,
  label,
  className,
  imageFallbackSrc,
  onError,
}) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const reportError = useCallback(() => {
    setStatus('error');
    onErrorRef.current?.();
  }, []);

  const { RiveComponent, rive } = useRive({
    src,
    autoplay: true,
    onLoadError: () => reportError(),
    onLoad: () => setStatus('ready'),
  });

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  useEffect(() => {
    if (rive) {
      setStatus('ready');
    }
  }, [rive]);

  if (status === 'error') {
    return (
      <FallbackView
        className={className}
        label={label}
        fallbackEmoji={fallbackEmoji}
        imageFallbackSrc={imageFallbackSrc}
      />
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ''}`}
      data-testid="rive-ready"
      aria-label={label}
      role="img"
    >
      {status === 'loading' && (
        <span
          className="absolute inset-0 flex items-center justify-center text-sm opacity-70"
          aria-hidden="true"
          data-testid="rive-loading"
        >
          {imageFallbackSrc ? (
            <img
              src={imageFallbackSrc}
              alt=""
              className="h-full w-full object-contain opacity-60"
            />
          ) : (
            fallbackEmoji
          )}
        </span>
      )}
      <RiveComponent
        className="h-full w-full"
        data-testid="rive-canvas"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

const RiveMascot: React.FC<RiveMascotProps> = ({
  src,
  fallbackEmoji = '💙⭐',
  label = 'Starlink mascot',
  className,
  onError,
  imageFallbackSrc,
}) => {
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const handleError = useCallback(() => {
    onErrorRef.current?.();
  }, []);

  useEffect(() => {
    if (!src) {
      handleError();
    }
  }, [src, handleError]);

  if (!src) {
    return (
      <FallbackView
        className={className}
        label={label}
        fallbackEmoji={fallbackEmoji}
        imageFallbackSrc={imageFallbackSrc}
      />
    );
  }

  return (
    <RiveRuntime
      src={src}
      fallbackEmoji={fallbackEmoji}
      label={label}
      className={className}
      imageFallbackSrc={imageFallbackSrc}
      onError={handleError}
    />
  );
};

export default RiveMascot;
