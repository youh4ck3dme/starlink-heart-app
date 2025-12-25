import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MascotRendererNew from '../components/mascot/MascotRendererNew';
import RiveMascotNew from '../components/mascot/RiveMascotNew';

describe('RiveMascotNew', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows fallback emoji when the asset fails to load', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    render(<RiveMascotNew src="/missing.riv" fallbackEmoji="💙⭐" />);

    await waitFor(() => {
      expect(screen.getByTestId('rive-fallback')).toHaveTextContent('💙⭐');
    });
  });

  it('shows fallback when no src provided', () => {
    render(<RiveMascotNew fallbackEmoji="🚀" />);
    
    expect(screen.getByTestId('rive-fallback')).toHaveTextContent('🚀');
  });
});

describe('MascotRendererNew', () => {
  it('falls back when no mascot source is available', () => {
    render(<MascotRendererNew fallbackEmoji="💙⭐" />);

    expect(screen.getByTestId('mascot-fallback')).toHaveTextContent('💙⭐');
  });

  it('uses custom fallback emoji', () => {
    render(<MascotRendererNew fallbackEmoji="🤖" />);
    
    expect(screen.getByTestId('mascot-fallback')).toHaveTextContent('🤖');
  });
});
