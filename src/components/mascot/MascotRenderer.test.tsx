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
  it('renders the static mascot image in image mode', () => {
    render(<MascotRenderer mode="image" avatar="⭐" />);

    expect(screen.getByAltText('Mascot Avatar')).toBeInTheDocument();
  });
});
