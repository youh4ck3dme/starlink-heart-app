import { StudentProfile } from './aiRewardEngine';

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  rank: number;
  badges: string[]; // e.g. ["Star Student", "Math Whiz"]
  trend: 'up' | 'down' | 'same';
}

export type LeaderboardScope = 'class' | 'school' | 'global';

// Váhy pre výpočet skóre
const WEIGHTS = {
  missions: 0.35,
  aiChallenges: 0.25,
  schoolGrades: 0.25,
  streak: 0.15
};

/**
 * Simuluje výpočet skóre na základe kritérií z "Galaktický Rebríček Hviezdnych Žiakov.MD"
 */
function calculateScore(stats: {
  missionsCompleted: number;
  aiSuccessRate: number; // 0..1
  gradeAverage: number; // 1..5 (kde 1 je najlepsie)
  streakDays: number;
}): number {
  // Normalizácia vstupov na skóre 0..1000
  const missionScore = Math.min(stats.missionsCompleted * 50, 1000); 
  const aiScore = stats.aiSuccessRate * 1000;
  
  // Známky: 1 = 1000, 5 = 0. Lineárna interpolácia.
  const gradeScore = Math.max(0, (5 - stats.gradeAverage) * 250); 
  
  const streakScore = Math.min(stats.streakDays * 50, 1000);

  return Math.floor(
    missionScore * WEIGHTS.missions +
    aiScore * WEIGHTS.aiChallenges +
    gradeScore * WEIGHTS.schoolGrades +
    streakScore * WEIGHTS.streak
  );
}

// Mock dáta pre rebríček
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', nickname: 'Nova Explorer', avatar: '⭐', score: 950, rank: 1, badges: ['Star Student'], trend: 'same' },
  { id: '2', nickname: 'Cosmic Ray', avatar: '☄️', score: 890, rank: 2, badges: [], trend: 'up' },
  { id: '3', nickname: 'Robo Tech', avatar: '🤖', score: 850, rank: 3, badges: ['Math Whiz'], trend: 'down' },
  { id: '4', nickname: 'Galaxy Girl', avatar: '⭐', score: 720, rank: 4, badges: [], trend: 'up' },
  { id: '5', nickname: 'Astro Boy', avatar: '🤖', score: 680, rank: 5, badges: [], trend: 'same' },
];

export const LeaderboardService = {
  getLeaderboard: async (scope: LeaderboardScope = 'global'): Promise<LeaderboardEntry[]> => {
    // TODO: Connect to backend. For now, return mock sort by score.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MOCK_LEADERBOARD].sort((a, b) => b.score - a.score));
      }, 500);
    });
  },

  getUserRank: async (userId: string): Promise<LeaderboardEntry | undefined> => {
    // Simulate finding user
    return MOCK_LEADERBOARD[0]; // Returns entry #1 for demo
  }
};
