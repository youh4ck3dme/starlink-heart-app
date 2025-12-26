import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StarlinkHeartApp from '../components/StarlinkHeartApp';

describe('StarlinkHeartApp Intro Layout', () => {
  it('renders intro image', () => {
    render(<StarlinkHeartApp />);
    
    // Check for the welcome image
    const image = screen.getByAltText(/Starlink Heart Welcome Screen/i);
    expect(image).toBeInTheDocument();
  });

  it('displays full screen start button', () => {
    // renders defaults to IntroScreen
    render(<StarlinkHeartApp />);
    
    // The button is the whole screen now
    const startButton = screen.getByRole('button', { name: /start/i });
    expect(startButton).toBeInTheDocument();
  });

  // Removed visibility test as it's always visible now (no video delay)
});
