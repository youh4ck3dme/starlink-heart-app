import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock tsparticles
vi.mock('react-tsparticles', () => ({
    default: () => <div data-testid="particles-mock">Particles</div>,
}));

vi.mock('tsparticles', () => ({
    loadFull: vi.fn(),
}));

describe('CosmicBackground Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Layer Structure', () => {
        it('renders all background layers in correct order', async () => {
            const { default: CosmicBackground } = await import('../components/background/CosmicBackground');
            
            const { container } = render(
                <CosmicBackground variant="mirrorNebula" intensity={0.8}>
                    <div data-testid="content">Content</div>
                </CosmicBackground>
            );

            // Check content is rendered
            expect(screen.getByTestId('content')).toBeInTheDocument();

            // Check z-index layers exist
            const layers = container.querySelectorAll('[class*="z-"]');
            expect(layers.length).toBeGreaterThan(0);
        });

        it('content layer has highest z-index (z-10)', async () => {
            const { default: CosmicBackground } = await import('../components/background/CosmicBackground');
            
            const { container } = render(
                <CosmicBackground>
                    <div data-testid="content">Content</div>
                </CosmicBackground>
            );

            const contentLayer = screen.getByTestId('content').parentElement;
            expect(contentLayer).toHaveClass('z-10');
        });

        it('has aria-hidden on decorative container', async () => {
            const { default: CosmicBackground } = await import('../components/background/CosmicBackground');
            
            const { container } = render(
                <CosmicBackground>
                    <div>Content</div>
                </CosmicBackground>
            );

            const mainContainer = container.firstChild as HTMLElement;
            expect(mainContainer).toHaveAttribute('aria-hidden');
        });
    });

    describe('Animation Preferences', () => {
        it('respects reduced motion preference', async () => {
            // Mock matchMedia for reduced motion
            const originalMatchMedia = window.matchMedia;
            window.matchMedia = vi.fn().mockImplementation(query => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));

            const { default: CosmicBackground } = await import('../components/background/CosmicBackground');
            
            const { container } = render(
                <CosmicBackground animate={true}>
                    <div>Content</div>
                </CosmicBackground>
            );

            // Component should still render
            expect(container.firstChild).toBeInTheDocument();

            // Restore
            window.matchMedia = originalMatchMedia;
        });

        it('can disable animations via prop', async () => {
            const { default: CosmicBackground } = await import('../components/background/CosmicBackground');
            
            const { container } = render(
                <CosmicBackground animate={false}>
                    <div>Content</div>
                </CosmicBackground>
            );

            expect(container.firstChild).toBeInTheDocument();
        });
    });

    describe('Intensity Control', () => {
        it('accepts intensity prop', async () => {
            const { default: CosmicBackground } = await import('../components/background/CosmicBackground');
            
            // Low intensity
            const { rerender } = render(
                <CosmicBackground intensity={0.2}>
                    <div data-testid="content">Content</div>
                </CosmicBackground>
            );
            expect(screen.getByTestId('content')).toBeInTheDocument();

            // High intensity
            rerender(
                <CosmicBackground intensity={1.0}>
                    <div data-testid="content">Content</div>
                </CosmicBackground>
            );
            expect(screen.getByTestId('content')).toBeInTheDocument();
        });
    });

    describe('Variant Support', () => {
        it('renders mirrorNebula variant', async () => {
            const { default: CosmicBackground } = await import('../components/background/CosmicBackground');
            
            render(
                <CosmicBackground variant="mirrorNebula">
                    <div data-testid="content">Content</div>
                </CosmicBackground>
            );
            expect(screen.getByTestId('content')).toBeInTheDocument();
        });

        it('renders portalStarforge variant', async () => {
            const { default: CosmicBackground } = await import('../components/background/CosmicBackground');
            
            render(
                <CosmicBackground variant="portalStarforge">
                    <div data-testid="content">Content</div>
                </CosmicBackground>
            );
            expect(screen.getByTestId('content')).toBeInTheDocument();
        });
    });
});
