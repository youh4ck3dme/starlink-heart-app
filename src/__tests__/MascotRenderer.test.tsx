import { render, screen } from '@testing-library/react';
import MascotRenderer from '../components/mascot/MascotRenderer';
import { vi, describe, it, expect } from 'vitest';

// Mock Starry3D (Spline component)
vi.mock('../components/mascot/Starry3D', () => ({
  default: () => <div data-testid="starry-3d">3D Mascot</div>
}));

describe('MascotRenderer', () => {
  it('renders Image when mode is image', () => {
    render(<MascotRenderer mode="image" />);
    expect(screen.getByAltText('Mascot Avatar')).toBeInTheDocument();
  });

  it('renders 3D when mode is spline3d AND scene is configured', async () => {
    render(<MascotRenderer mode="spline3d" splineScene="https://prod.spline.design/valid-scene" />);
    const element = await screen.findByTestId('starry-3d');
    expect(element).toBeInTheDocument();
  });

  it('FALLBACKS to image when mode is spline3d BUT scene is NOT configured', () => {
    render(<MascotRenderer mode="spline3d" splineScene="PASTE_YOUR_SPLINE_URL_HERE" />);
    // Now falls back to image, not rive
    expect(screen.getByAltText('Mascot Avatar')).toBeInTheDocument();
  });

  it('defaults to image mode when no mode specified', () => {
    // @ts-expect-error Testing default behavior
    render(<MascotRenderer />);
    expect(screen.getByAltText('Mascot Avatar')).toBeInTheDocument();
  });
});
