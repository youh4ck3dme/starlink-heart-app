import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StarlinkHeartApp from '../components/StarlinkHeartApp';
import { GamificationProvider } from '../features/gamification/context/GamificationContext';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

// Mock dependencies
vi.mock('../features/gamification/services/aiRewardEngine', () => ({
  generateDailyChallenges: vi.fn().mockResolvedValue([]),
  calculateRewards: vi.fn().mockResolvedValue({ xp: 0, gems: 0 }),
}));

// Setup router wrapper for StarlinkHeartApp
const renderAppWithLevel = async (level: number) => {
    const initialState = {
        xp: level >= 11 ? 250 : level >= 6 ? 65 : 0, // Approx XP for requested level
        level: level,
        streakDays: 0,
        freezesLeft: 3,
        unlockedBadges: [],
        userName: 'Kadet',
        gender: 'unspecified' as const,
    };
    
    // Ensure hearts are empty to show intro text
    localStorage.setItem('starlink_hearts_v1', '[]');
    localStorage.setItem('hasStarted', 'true');

    const router = createMemoryRouter([
        {
            path: '/home',
            element: <StarlinkHeartApp />
        }
    ], {
        initialEntries: ['/home'],
    });

    return render(
        <GamificationProvider initialState={initialState}>
            <RouterProvider router={router} />
        </GamificationProvider>
    );
};

describe('Avatar Progression System', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('displays Robot avatar 🤖 for Level 1 (Beginner)', async () => {
        await act(async () => {
            await renderAppWithLevel(1);
        });
        
        // Handle Welcome Screen if present
        const startBtn = screen.queryByRole('button', { name: /Start App|ŠTART|Začať/i });
        if (startBtn) {
            act(() => {
                startBtn.click();
            });
            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /Start App|ŠTART|Začať/i })).not.toBeInTheDocument();
            }, { timeout: 3000 });
        }

        // Wait for Dashboard Header
        await waitFor(() => {
             expect(screen.getByText(/Lvl 1/)).toBeInTheDocument();
        });
        
        // Robot check
        const avatars = screen.getAllByRole('img');
        const robotAvatar = avatars.find(img => (img as HTMLImageElement).src.includes('roboto'));
        expect(robotAvatar).toBeDefined();
    });

    it('displays Cometa avatar ☄️ for Level 6 (Intermediate)', async () => {
        await act(async () => {
            await renderAppWithLevel(6);
        });
        
        const startBtn = screen.queryByRole('button', { name: /Start App|ŠTART|Začať/i });
        if (startBtn) {
            act(() => {
                startBtn.click();
            });
            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /Start App|ŠTART|Začať/i })).not.toBeInTheDocument();
            }, { timeout: 3000 });
        }

        await waitFor(() => {
             expect(screen.getByText(/Lvl 6/)).toBeInTheDocument();
        });
        
        // Comet check
        const avatars = screen.getAllByRole('img');
        const cometAvatar = avatars.find(img => (img as HTMLImageElement).src.includes('cometa'));
        expect(cometAvatar).toBeDefined();
    });

    it('displays Starry avatar ⭐ for Level 11 (Advanced)', async () => {
        await act(async () => {
            await renderAppWithLevel(11);
        });
        
        const startBtn = screen.queryByRole('button', { name: /Start App|ŠTART|Začať/i });
        if (startBtn) {
            act(() => {
                startBtn.click();
            });
            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /Start App|ŠTART|Začať/i })).not.toBeInTheDocument();
            }, { timeout: 3000 });
        }

        await waitFor(() => {
             expect(screen.getByText(/Lvl 11/)).toBeInTheDocument();
        });
        
        // Starry check
        const avatars = screen.getAllByRole('img');
        const starryAvatar = avatars.find(img => (img as HTMLImageElement).src.includes('starry'));
        expect(starryAvatar).toBeDefined();
    });
});
