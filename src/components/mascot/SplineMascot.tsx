import React, { useCallback, useEffect, useRef, useState } from 'react';

type SplineMascotProps = {
  url?: string;
  fallbackEmoji?: string;
  label?: string;
  className?: string;
  onError?: () => void;
  /** Milliseconds to wait for a successful load handshake before falling back */
  loadTimeoutMs?: number;
};

const SplineMascot: React.FC<SplineMascotProps> = ({
  url,
  fallbackEmoji = '💙⭐',
  label = 'Starlink mascot',
  className,
  onError,
  loadTimeoutMs = 8000,
}) => {
  const [hasError, setHasError] = useState(!url);
  const [isReady, setIsReady] = useState(false);
  const onErrorRef = useRef(onError);
  const readyRef = useRef(false);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsReady(false);
    onErrorRef.current?.();
  }, []);

  useEffect(() => {
    readyRef.current = false;
    setIsReady(false);
    setHasError(!url);

    if (!url) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (!readyRef.current) {
        handleError();
      }
    }, loadTimeoutMs);

    const onMessage = (event: MessageEvent) => {
      // Spline viewer / scene handshake: accept ready signals from the iframe origin.
      if (!url) return;
      try {
        const origin = new URL(url, window.location.href).origin;
        if (event.origin !== origin && event.origin !== window.location.origin) {
          return;
        }
      } catch {
        return;
      }

      const data = event.data;
      const type =
        typeof data === 'string'
          ? data
          : data && typeof data === 'object'
            ? (data as { type?: string }).type
            : undefined;

      if (
        type === 'spline-ready' ||
        type === 'spline:ready' ||
        type === 'ready' ||
        type === 'viewer-ready'
      ) {
        readyRef.current = true;
        setIsReady(true);
        window.clearTimeout(timeoutId);
      }

      if (type === 'spline-error' || type === 'spline:error' || type === 'error') {
        window.clearTimeout(timeoutId);
        handleError();
      }
    };

    window.addEventListener('message', onMessage);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('message', onMessage);
    };
  }, [url, loadTimeoutMs, handleError]);

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
    <div className={`relative ${className ?? ''}`} data-testid="spline-container">
      {!isReady && (
        <div
          className="absolute inset-0 flex items-center justify-center text-sm opacity-70"
          data-testid="spline-loading"
          aria-hidden="true"
        >
          {fallbackEmoji}
        </div>
      )}
      <iframe
        title={label}
        src={url}
        className="h-full w-full border-0"
        onLoad={() => {
          // iframe onLoad only means the document shell loaded; mark tentative ready
          // and still rely on timeout / postMessage for true health.
          readyRef.current = true;
          setIsReady(true);
        }}
        onError={handleError}
        data-testid="spline-frame"
        allow="autoplay; fullscreen"
      />
    </div>
  );
};

export default SplineMascot;
