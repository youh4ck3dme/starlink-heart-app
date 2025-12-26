export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji for simplicity, or Lottie path later
  condition: (state: any) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'streak-7',
    name: 'Nezastaviteľný',
    description: 'Drž si streak 7 dní v kuse!',
    icon: '🚀',
    condition: (state) => state.streakDays >= 7
  },
  {
    id: 'xp-100',
    name: 'Začínajúci Hrdina',
    description: 'Nazbieraj prvých 100 XP.',
    icon: '🛡️',
    condition: (state) => state.xp >= 100
  },
  {
    id: 'xp-500',
    name: 'Bohatier',
    description: 'Nazbieraj 500 XP.',
    icon: '💎',
    condition: (state) => state.xp >= 500
  },
  {
    id: 'level-5',
    name: 'Veľký Mozog',
    description: 'Dosiahni Level 5.',
    icon: '🧠',
    condition: (state) => state.level >= 5
  }
];
