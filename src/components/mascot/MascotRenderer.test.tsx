import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MascotRenderer from './MascotRenderer';
import RiveMascot from './RiveMascot';

describe('RiveMascot', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows fallback emoji when the asset fails to load', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    render(<RiveMascot src="/missing.riv" fallbackEmoji="💙⭐" />);

    await waitFor(() => {
      expect(screen.getByTestId('rive-fallback')).toHaveTextContent('💙⭐');
    });
  });
});

describe('MascotRenderer', () => {
  it('falls back when no mascot source is available', () => {
    render(<MascotRenderer fallbackEmoji="💙⭐" />);

    expect(screen.getByTestId('mascot-fallback')).toHaveTextContent('💙⭐');
  });
});
