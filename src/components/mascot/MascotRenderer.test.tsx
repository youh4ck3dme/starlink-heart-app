import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MascotRenderer from './MascotRenderer';
import RiveMascot from './RiveMascot';
import SplineMascot from './SplineMascot';

vi.mock('@rive-app/react-canvas', () => ({
  useRive: () => ({
    RiveComponent: (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div data-testid="rive-canvas" {...props} />
    ),
    rive: null,
  }),
}));

vi.mock('./Starry3D', () => ({
  default: () => <div data-testid="starry-3d">3D Mascot</div>,
}));

describe('RiveMascot', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows fallback emoji when no src is provided', async () => {
    render(<RiveMascot fallbackEmoji="💙⭐" />);

    await waitFor(() => {
      expect(screen.getByTestId('rive-fallback')).toHaveTextContent('💙⭐');
    });
  });

  it('renders the rive surface when src is provided', () => {
    render(<RiveMascot src="/animations/starry.riv" fallbackEmoji="💙⭐" />);
    expect(screen.getByTestId('rive-canvas')).toBeInTheDocument();
  });
});

describe('SplineMascot', () => {
  it('falls back when url is missing', () => {
    render(<SplineMascot fallbackEmoji="💙⭐" />);
    expect(screen.getByTestId('spline-fallback')).toHaveTextContent('💙⭐');
  });

  it('falls back when the iframe reports a spline error via postMessage', async () => {
    render(
      <SplineMascot
        url="https://example.com/scene"
        fallbackEmoji="💙⭐"
        loadTimeoutMs={60_000}
      />
    );

    expect(screen.getByTestId('spline-frame')).toBeInTheDocument();

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://example.com',
        data: { type: 'spline-error' },
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId('spline-fallback')).toHaveTextContent('💙⭐');
    });
  });
});

describe('MascotRenderer', () => {
  it('renders the static mascot image in image mode', () => {
    render(<MascotRenderer mode="image" avatar="⭐" fallbackEmoji="💙⭐" />);
    expect(screen.getByAltText('Mascot Avatar')).toBeInTheDocument();
  });

  it('renders rive mode through the production renderer', () => {
    render(<MascotRenderer mode="rive" riveSrc="/animations/starry.riv" />);
    expect(screen.getByTestId('rive-canvas')).toBeInTheDocument();
  });

  it('renders spline3d when scene is configured', async () => {
    render(
      <MascotRenderer mode="spline3d" splineScene="https://prod.spline.design/valid-scene" />
    );
    expect(await screen.findByTestId('starry-3d')).toBeInTheDocument();
  });
});
