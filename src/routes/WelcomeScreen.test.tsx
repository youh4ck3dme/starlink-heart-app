import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import WelcomeScreen from './WelcomeScreen';
import { STARRY_BACKGROUND_KEY } from '../constants/theme';

const renderWelcome = () =>
  render(
    <MemoryRouter>
      <WelcomeScreen />
    </MemoryRouter>
  );

describe('WelcomeScreen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists background selection', async () => {
    const user = userEvent.setup();
    renderWelcome();

    const marsButton = screen.getByTestId('background-option-mars');
    await user.click(marsButton);

    expect(localStorage.getItem(STARRY_BACKGROUND_KEY)).toBe('mars');
    expect(screen.getByTestId('welcome-screen')).toHaveClass('bg-mars-sunset');
  });

  it('hydrates background from storage', () => {
    localStorage.setItem(STARRY_BACKGROUND_KEY, 'galaxy');
    renderWelcome();

    expect(screen.getByTestId('welcome-screen')).toHaveClass('bg-galaxy-swirl');
  });
});
