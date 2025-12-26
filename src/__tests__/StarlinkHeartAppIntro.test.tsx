import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StarlinkHeartApp from '../components/StarlinkHeartApp';

describe('StarlinkHeartApp Intro Layout', () => {
  it('renders intro video', () => {
    const { container } = render(<StarlinkHeartApp />);
    // Check for video tag
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    // Verify it's trying to play
    expect(video).toHaveAttribute('autoplay');
  });

  it('displays start button and manages visibility', () => {
    const { container } = render(<StarlinkHeartApp />);
    const startButton = screen.getByRole('button', { name: /štart/i });
    expect(startButton).toBeInTheDocument();
    
    // Check initial hidden state (wrapper div has opacity-0)
    // We navigate up to the div wrapper
    const wrapper = startButton.closest('div');
    expect(wrapper).toHaveClass('opacity-0');

    // Simulate video end
    const video = container.querySelector('video');
    if (video) {
        fireEvent.ended(video);
    }

    // Check visible state
    expect(wrapper).toHaveClass('opacity-100');
  });
});
