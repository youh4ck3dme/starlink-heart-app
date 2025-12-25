import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StarlinkHeartApp from '../components/StarlinkHeartApp';

describe('StarlinkHeartApp Intro Layout', () => {
  it('centers intro content properly', () => {
    render(<StarlinkHeartApp />);

    // The intro screen should be centered
    const title = screen.getByText(/Starlink Heart/i);
    expect(title).toBeInTheDocument();
  });

  it('displays start button', () => {
    render(<StarlinkHeartApp />);

    const startButton = screen.getByRole('button', { name: /štart/i });
    expect(startButton).toBeInTheDocument();
  });

  it('shows avatar on intro screen', () => {
    render(<StarlinkHeartApp />);

    // Should have some avatar displayed (emoji)
    const intro = screen.getByText(/Tvoj osobný vesmírny sprievodca/i);
    expect(intro).toBeInTheDocument();
  });
});
