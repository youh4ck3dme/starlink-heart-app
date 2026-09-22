/**
 * XP Gamification Service
 * 
 * Simple localStorage-based XP and leveling system for kids.
 * Keeps them motivated and engaged.
 */

const XP_KEY = 'starlink_xp';
const LEVEL_KEY = 'starlink_level';
const STREAK_KEY = 'starlink_streak';
const LAST_ACTIVITY_KEY = 'starlink_last_activity';

// XP required for each level (exponential growth)
const XP_PER_LEVEL = [
  0,    // Level 1
  50,   // Level 2
  150,  // Level 3
  300,  // Level 4
  500,  // Level 5
  750,  // Level 6
  1050, // Level 7
  1400, // Level 8
  1800, // Level 9
  2250, // Level 10
];

export interface PlayerStats {
  xp: number;
  level: number;
  streak: number;
  xpToNextLevel: number;
  progress: number; // 0-100
  title: string;
}

/**
 * Get current player stats
 */
export function getPlayerStats(): PlayerStats {
  const xp = parseInt(localStorage.getItem(XP_KEY) || '0');
  const level = parseInt(localStorage.getItem(LEVEL_KEY) || '1');
  
  const currentLevelXp = XP_PER_LEVEL[level - 1] || 0;
  const nextLevelXp = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  
  const progress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const xpToNextLevel = nextLevelXp - xp;
  
  const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0');
  
  return {
    xp,
    level,
    streak,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    progress,
    title: getLevelTitle(level),
  };
}

/**
 * Award XP and check for level up
 */
export function awardXP(amount: number): { leveledUp: boolean; newLevel: number; totalXP: number } {
  const stats = getPlayerStats();
  const newXP = stats.xp + amount;
  
  localStorage.setItem(XP_KEY, newXP.toString());
  
  // Check for level up
  let newLevel = stats.level;
  while (newLevel < XP_PER_LEVEL.length && newXP >= XP_PER_LEVEL[newLevel]) {
    newLevel++;
  }
  
  const leveledUp = newLevel > stats.level;
  
  if (leveledUp) {
    localStorage.setItem(LEVEL_KEY, newLevel.toString());
  }
  
  // Update streak
  updateStreak();
  
  return { leveledUp, newLevel, totalXP: newXP };
}

/**
 * Update daily streak
 */
function updateStreak(): void {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  const today = new Date().toDateString();
  
  if (!lastActivity) {
    // First activity
    localStorage.setItem(STREAK_KEY, '1');
    localStorage.setItem(LAST_ACTIVITY_KEY, today);
    return;
  }
  
  const lastDate = new Date(lastActivity);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day, no change
    return;
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    const currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0');
    localStorage.setItem(STREAK_KEY, (currentStreak + 1).toString());
  } else {
    // Streak broken, reset
    localStorage.setItem(STREAK_KEY, '1');
  }
  
  localStorage.setItem(LAST_ACTIVITY_KEY, today);
}

/**
 * Get level title (Slovak kid-friendly titles)
 */
function getLevelTitle(level: number): string {
  const titles = [
    'Kozmický Nováčik',    // Level 1
    'Hviezdny Študent',     // Level 2
    'Galaktický Prieskumník', // Level 3
    'Planetárny Majster',   // Level 4
    'Vesmírny Génius',      // Level 5
    'Supernova Talent',     // Level 6
    'Čierna Diera Múdrosti', // Level 7
    'Kvazárový Expert',     // Level 8
    'Galaxový Profesor',    // Level 9
    'Vesmírny Maestro',     // Level 10
  ];
  
  return titles[level - 1] || titles[titles.length - 1];
}

/**
 * Reset all progress (for testing or user request)
 */
export function resetProgress(): void {
  localStorage.removeItem(XP_KEY);
  localStorage.removeItem(LEVEL_KEY);
  localStorage.removeItem(STREAK_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}
