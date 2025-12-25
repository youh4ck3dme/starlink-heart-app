import React from 'react';
import { render, screen } from '@testing-library/react';
import StarlinkHeartApp from './StarlinkHeartApp';

describe('StarlinkHeartApp intro layout', () => {
  it('centers intro content on mobile', () => {
    render(<StarlinkHeartApp />);

    const intro = screen.getByTestId('intro-screen');
    expect(intro).toHaveClass('min-h-[100dvh]');
    expect(intro).toHaveClass('items-center');
    expect(intro).toHaveClass('justify-center');
  });
});
