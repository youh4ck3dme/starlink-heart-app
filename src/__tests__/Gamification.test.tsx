import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DailyMissionsCard } from '../components/gamification/DailyMissionsCard';
import { LevelUpModal } from '../components/gamification/LevelUpModal';

// Mock dependencies
vi.mock('../features/gamification/services/aiRewardEngine', () => ({
    generateDailyChallenges: vi.fn(),
}));

// Mock sound/haptics
vi.mock('../../utils/haptics', () => ({
    tapHaptic: vi.fn(),
    successHaptic: vi.fn(),
}));

vi.mock('../../utils/sound', () => ({
    playSound: vi.fn(),
}));

import { generateDailyChallenges } from '../features/gamification/services/aiRewardEngine';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Gamification System', () => {
    
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    // Mock Data
    const mockMissions = [
        { id: 'm1', type: 'message', title: 'Test Mission', xpReward: 10, difficulty: 'easy' },
        { id: 'm2', type: 'camera', title: 'Photo Mission', xpReward: 20, difficulty: 'medium' }
    ];

    test('DailyMissionsCard renders missions provided by AI Engine', async () => {
        (generateDailyChallenges as any).mockResolvedValue(mockMissions);
        const mockOnGemEarned = vi.fn();

        render(<DailyMissionsCard onGemEarned={mockOnGemEarned} />);
        
        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByText('Test Mission')).toBeInTheDocument();
            expect(screen.getByText('Photo Mission')).toBeInTheDocument();
        });
    });

    test('DailyMissionsCard completes mission on click and rewards gems', async () => {
        (generateDailyChallenges as any).mockResolvedValue(mockMissions);
        const mockOnGemEarned = vi.fn();
        
        render(<DailyMissionsCard onGemEarned={mockOnGemEarned} />);
        
        await waitFor(() => {
            expect(screen.getByText('Test Mission')).toBeInTheDocument();
        });

        // Click the mission to complete it
        const missionBtn = screen.getByText('Test Mission').closest('button');
        fireEvent.click(missionBtn!);
        
        // Check for visual feedback (optional, depending on implementation details)
        // Check callback
        await waitFor(() => {
            expect(mockOnGemEarned).toHaveBeenCalledWith(10);
        });
    });

    test('LevelUpModal renders correctly', () => {
        const onClose = vi.fn();
        render(<LevelUpModal level={2} title="Kadet" onClose={onClose} />);
        
        expect(screen.getByText('LEVEL UP!')).toBeInTheDocument();
        expect(screen.getByText('Úroveň 2')).toBeInTheDocument();
        
        // Check close button
        const closeBtn = screen.getByText('Pokračovať');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });
});
