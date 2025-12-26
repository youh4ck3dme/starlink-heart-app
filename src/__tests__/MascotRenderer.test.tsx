import { render, screen } from '@testing-library/react';
import MascotRenderer from '@/components/mascot/MascotRenderer';

// Mock Rive and Starry3D
vi.mock('@/components/mascot/RiveMascot', () => ({
  default: () => <div data-testid="rive-mascot">Rive Mascot</div>
}));

vi.mock('@/components/mascot/Starry3D', () => ({
  default: () => <div data-testid="starry-3d">3D Mascot</div>
}));

describe('MascotRenderer', () => {
  it('renders Rive by default', async () => {
    // @ts-ignore
    render(<MascotRenderer mode="rive" />);
    // Use findBy for lazy loaded component
    const element = await screen.findByTestId('rive-mascot');
    expect(element).toBeInTheDocument();
  });

  it('renders Image when mode is image', () => {
    render(<MascotRenderer mode="image" />);
    expect(screen.getByAltText('Starry Loading')).toBeInTheDocument();
  });

  it('renders 3D when mode is spline3d AND scene is configured', async () => {
    render(<MascotRenderer mode="spline3d" splineScene="https://prod.spline.design/valid-scene" />);
    // Since it's lazy loaded/suspense, might need wait
    const element = await screen.findByTestId('starry-3d');
    expect(element).toBeInTheDocument();
  });

  it('FALLBACKS to Rive when mode is spline3d BUT scene is NOT configured', async () => {
    render(<MascotRenderer mode="spline3d" splineScene="PASTE_YOUR_SPLINE_URL_HERE" />);
    
    // Should see Rive (default fallback) after lazy load
    const rive = await screen.findByTestId('rive-mascot');
    expect(rive).toBeInTheDocument();

    // Should NOT see 3D
    const threeD = screen.queryByTestId('starry-3d');
    expect(threeD).not.toBeInTheDocument();
  });
});
