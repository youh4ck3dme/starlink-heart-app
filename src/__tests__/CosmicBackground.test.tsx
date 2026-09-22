import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock tsparticles
vi.mock('react-tsparticles', () => ({
    default: () => <div data-testid="particles-mock">Particles</div>,
}));

vi.mock('tsparticles', () => ({
    loadFull: vi.fn(),
}));

// Mock framer-motion to avoid animation hangs
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => (
            <div className={className} data-testid="motion-div" {...props}>
                {children}
            </div>
        ),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useMotionValue: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
    useSpring: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
    useTransform: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
}));

import CosmicBackground from '../components/background/CosmicBackground';

describe('CosmicBackground Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Basic Render Test
    it('renders content safely', () => {
        render(
            <CosmicBackground>
                <div data-testid="content">Test Content</div>
            </CosmicBackground>
        );
        expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders with luxury variant', () => {
        const { container } = render(
            <CosmicBackground variant="luxury">
                <div>Content</div>
            </CosmicBackground>
        );
        expect(container).toBeInTheDocument();
    });

    it('renders with reduced motion (mocked)', () => {
        const { container } = render(
            <CosmicBackground animate={false}>
                <div>Content</div>
            </CosmicBackground>
        );
        expect(container).toBeInTheDocument();
    });
});
