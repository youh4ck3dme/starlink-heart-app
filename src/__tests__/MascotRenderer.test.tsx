import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MascotRenderer from '../components/mascot/MascotRenderer';

vi.mock('../components/mascot/Starry3D', () => ({
  default: () => <div data-testid="starry-3d">3D Mascot</div>,
}));

vi.mock('@rive-app/react-canvas', () => ({
  useRive: () => ({
    RiveComponent: (props: Record<string, unknown>) => (
      <div data-testid="rive-canvas" {...props} />
    ),
    rive: { play: vi.fn() },
  }),
}));

describe('MascotRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Image when mode is image', () => {
    render(<MascotRenderer mode="image" />);
    expect(screen.getByAltText('Mascot Avatar')).toBeInTheDocument();
  });

  it('renders 3D when mode is spline3d AND scene is configured', async () => {
    render(
      <MascotRenderer mode="spline3d" splineScene="https://prod.spline.design/valid-scene" />
    );
    const element = await screen.findByTestId('starry-3d');
    expect(element).toBeInTheDocument();
  });

  it('FALLBACKS to image when mode is spline3d BUT scene is NOT configured', () => {
    render(<MascotRenderer mode="spline3d" splineScene="PASTE_YOUR_SPLINE_URL_HERE" />);
    expect(screen.getByAltText('Mascot Avatar')).toBeInTheDocument();
  });

  it('defaults to image mode when no mode specified', () => {
    render(<MascotRenderer />);
    expect(screen.getByAltText('Mascot Avatar')).toBeInTheDocument();
  });

  it('renders rive runtime when mode is rive', () => {
    render(<MascotRenderer mode="rive" riveSrc="/animations/starry.riv" />);
    expect(screen.getByTestId('rive-canvas')).toBeInTheDocument();
  });
});
