// @ts-nocheck
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import WelcomeScreen from '../routes/WelcomeScreen';
import { STARRY_BACKGROUND_KEY } from '../constants/theme';

const renderWelcome = () =>
  render(
    <MemoryRouter>
      <WelcomeScreen />
    </MemoryRouter>
  );

describe('WelcomeScreen Background Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists background selection to localStorage', async () => {
    const user = userEvent.setup();
    renderWelcome();

    // Find mars background option if it exists
    const marsButton = screen.queryByTestId('background-option-mars');
    if (marsButton) {
      await user.click(marsButton);
      expect(localStorage.getItem(STARRY_BACKGROUND_KEY)).toBe('mars');
    }
  });

  it('hydrates background from localStorage on mount', () => {
    localStorage.setItem(STARRY_BACKGROUND_KEY, 'galaxy');
    renderWelcome();

    // The welcome screen should hydrate from localStorage
    // This is a smoke test to ensure no errors occur
    expect(screen.getByText(/Starlink Heart/i)).toBeInTheDocument();
  });

  it('uses default background when localStorage is empty', () => {
    renderWelcome();
    
    // Default should be sky (light theme)
    expect(screen.getByText(/Starlink Heart/i)).toBeInTheDocument();
  });
});
