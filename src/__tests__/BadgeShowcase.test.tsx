import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GamificationProvider } from '../features/gamification/context/GamificationContext';
import { BadgeShowcase } from '../components/gamification/BadgeShowcase';

// Mock sound utility
vi.mock('../utils/sound', () => ({
    playSound: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        },
        AnimatePresence: ({ children }: any) => <>{children}</>,
    };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <GamificationProvider>
        {children}
    </GamificationProvider>
);

describe('BadgeShowcase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('Rendering', () => {
        it('renders badge showcase container', () => {
            render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            expect(screen.getByText('🏅')).toBeInTheDocument();
            expect(screen.getByText('Sieň Slávy')).toBeInTheDocument();
        });

        it('renders all badge slots', () => {
            render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            // Should have 4 badges defined
            expect(screen.getByText('Nezastaviteľný')).toBeInTheDocument();
            expect(screen.getByText('Začínajúci Hrdina')).toBeInTheDocument();
            expect(screen.getByText('Bohatier')).toBeInTheDocument();
            expect(screen.getByText('Veľký Mozog')).toBeInTheDocument();
        });
    });

    describe('Locked State', () => {
        it('shows lock icon for unearned badges', () => {
            render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            // All badges should be locked initially (show 🔒)
            const locks = screen.getAllByText('🔒');
            expect(locks.length).toBeGreaterThan(0);
        });

        it('locked badges have reduced opacity', () => {
            const { container } = render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            const lockedBadges = container.querySelectorAll('.opacity-50');
            expect(lockedBadges.length).toBeGreaterThan(0);
        });

        it('locked badges have grayscale filter', () => {
            const { container } = render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            const grayscaleBadges = container.querySelectorAll('.grayscale');
            expect(grayscaleBadges.length).toBeGreaterThan(0);
        });
    });

    describe('Unlocked State', () => {
        it('shows badge icon when unlocked', () => {
            // Pre-populate localStorage with unlocked badges
            localStorage.setItem('starlink_gamification_v1', JSON.stringify({
                xp: 500,
                level: 5,
                streakDays: 0,
                freezesLeft: 3,
                unlockedBadges: ['xp-100', 'xp-500']
            }));

            render(
                <GamificationProvider>
                    <BadgeShowcase />
                </GamificationProvider>
            );

            // Should show actual badge icons for unlocked ones
            expect(screen.getByText('🛡️')).toBeInTheDocument(); // xp-100
            expect(screen.getByText('💎')).toBeInTheDocument(); // xp-500
        });
    });

    describe('Interactions', () => {
        it('clicking unlocked badge triggers sound', async () => {
            const { playSound } = await import('../utils/sound');
            
            localStorage.setItem('starlink_gamification_v1', JSON.stringify({
                xp: 100,
                level: 2,
                streakDays: 0,
                freezesLeft: 3,
                unlockedBadges: ['xp-100']
            }));

            render(
                <GamificationProvider>
                    <BadgeShowcase />
                </GamificationProvider>
            );

            const unlockedBadge = screen.getByText('🛡️').closest('div[class*="aspect-square"]');
            if (unlockedBadge) {
                fireEvent.click(unlockedBadge);
                expect(playSound).toHaveBeenCalledWith('click');
            }
        });
    });

    describe('Layout', () => {
        it('uses 4-column grid layout', () => {
            const { container } = render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            const grid = container.querySelector('.grid-cols-4');
            expect(grid).toBeInTheDocument();
        });

        it('badges are square (aspect-square)', () => {
            const { container } = render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            const squareBadges = container.querySelectorAll('.aspect-square');
            expect(squareBadges.length).toBe(4);
        });
    });

    describe('Styling', () => {
        it('has glassmorphism effect', () => {
            const { container } = render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            const glassContainer = container.querySelector('.backdrop-blur-md');
            expect(glassContainer).toBeInTheDocument();
        });

        it('has rounded corners', () => {
            const { container } = render(
                <TestWrapper>
                    <BadgeShowcase />
                </TestWrapper>
            );

            const roundedContainer = container.querySelector('.rounded-3xl');
            expect(roundedContainer).toBeInTheDocument();
        });
    });
});
