import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DailyMissionsCard } from '../components/gamification/DailyMissionsCard';
import { LevelUpModal } from '../components/gamification/LevelUpModal';
import { incrementMissionProgress, getDailyMissions, saveMissions, Mission } from '../services/missionService';

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

    test('MissionService generates missions', () => {
        const missions = getDailyMissions();
        expect(missions.length).toBeGreaterThan(0);
        expect(missions[0]).toHaveProperty('id');
        expect(missions[0]).toHaveProperty('progress', 0);
    });

    test('MissionService tracks progress', () => {
        // Initial state
        let missions = getDailyMissions();
        const firstMissionType = missions[0].type;
        
        // Increment
        incrementMissionProgress(firstMissionType);
        
        // Check update
        missions = getDailyMissions();
        expect(missions[0].progress).toBe(1);
    });

    test('DailyMissionsCard renders missions', async () => {
        const mockOnGemEarned = vi.fn();
        
        // Prevent regeneration
        window.localStorage.setItem('starlink_last_login_date', new Date().toDateString());

        // Seed missions
        const missions: Mission[] = [
            { id: 'm1', type: 'MESSAGE_SENT', label: 'Test Mission', target: 1, progress: 0, completed: false, reward: 10 }
        ];
        saveMissions(missions);

        render(<DailyMissionsCard onGemEarned={mockOnGemEarned} />);
        
        expect(screen.getByText('Test Mission')).toBeDefined();
        expect(screen.getByText('0 / 1')).toBeDefined();
    });

    test('DailyMissionsCard allows claiming reward', async () => {
        const mockOnGemEarned = vi.fn();

        // Prevent regeneration
        window.localStorage.setItem('starlink_last_login_date', new Date().toDateString());
        
        // Seed completed mission
        const missions: Mission[] = [
            { id: 'm1', type: 'MESSAGE_SENT', label: 'Test Mission', target: 1, progress: 1, completed: false, reward: 10 }
        ];
        saveMissions(missions);

        render(<DailyMissionsCard onGemEarned={mockOnGemEarned} />);
        
        const claimButton = screen.getByText('Získať 💎10');
        fireEvent.click(claimButton);
        
        expect(mockOnGemEarned).toHaveBeenCalledWith(10);
    });

    test('LevelUpModal renders correctly', () => {
        const onClose = vi.fn();
        render(<LevelUpModal level={2} title="Kadet" onClose={onClose} />);
        
        expect(screen.getByText('LEVEL UP!')).toBeDefined();
        expect(screen.getByText('Úroveň 2')).toBeDefined();
    });
});
