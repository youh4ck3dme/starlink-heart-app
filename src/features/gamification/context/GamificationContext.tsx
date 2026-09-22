import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { BADGES } from '../config/badges';
import { playSound } from '../../../utils/sound'; // Sound feedback for badges

type State = {
  xp: number;
  level: number;
  streakDays: number;
  freezesLeft: number;
  unlockedBadges: string[];
  userName: string;
  gender: 'boy' | 'girl' | 'unspecified';
};

const initial: State = { 
  xp: 0, 
  level: 1, 
  streakDays: 0, 
  freezesLeft: 3, 
  unlockedBadges: [],
  userName: 'Kadet',
  gender: 'unspecified'
};

type Action =
  | { type: 'GAIN_XP'; amount: number }
  | { type: 'TICK_STREAK' }
  | { type: 'FREEZE_STREAK' }
  | { type: 'RESET' }
  | { type: 'UNLOCK_BADGE'; badgeId: string }
  | { type: 'UPDATE_PROFILE'; userName: string; gender: 'boy' | 'girl' | 'unspecified' };

function levelFor(xp: number) {
  // Upravená krivka: Pomalší rast, aby levely nelietali
  // Level 1 = 0-99 XP
  // Level 2 = 100 XP
  // Level 10 = ~2500 XP
  return Math.floor(1 + Math.sqrt(xp) / 5); 
}

// Avatar progression based on level
// Robot (1-5) → Comet (6-10) → Starry (11+)
export function getAvatarForLevel(level: number): string {
  if (level >= 11) return '⭐'; // Starry - Final form
  if (level >= 6) return '☄️';  // Comet - Mid tier
  return '🤖';                   // Robot - Starter
}

export function getAvatarName(level: number): string {
  if (level >= 11) return 'Starry';
  if (level >= 6) return 'Cometa';
  return 'Robo';
}

export function getLevelTitle(level: number): string {
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

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Inverse of levelFor: (level - 1) * 5 = sqrt(xp) -> xp = ((level - 1) * 5)^2
  return Math.pow((level - 1) * 5, 2);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'GAIN_XP': {
      const xp = state.xp + Math.max(0, action.amount);
      const newLevel = levelFor(xp);
      const levelUp = newLevel > state.level;
      
      if (levelUp) playSound('levelUp');

      // Check badges immediately
      const newState = { ...state, xp, level: newLevel };
      const newBadges = BADGES.filter(b => !state.unlockedBadges.includes(b.id) && b.condition(newState));
      
      if (newBadges.length > 0) {
          // Trigger unlock in next tick or imply it here (simplified)
          // For simplicity, we just add them
          newBadges.forEach(() => playSound('success')); // Badge sound
          return { ...newState, unlockedBadges: [...state.unlockedBadges, ...newBadges.map(b => b.id)] };
      }

      return newState;
    }
    case 'TICK_STREAK': {
      const streakDays = state.streakDays + 1;
      const tempState = { ...state, streakDays };
       // Check streak badges
      const newBadges = BADGES.filter(b => !state.unlockedBadges.includes(b.id) && b.condition(tempState));
      
      return { 
          ...tempState, 
          unlockedBadges: [...state.unlockedBadges, ...newBadges.map(b => b.id)] 
      };
    }
    case 'FREEZE_STREAK': {
      if (state.freezesLeft <= 0) return state;
      return { ...state, freezesLeft: state.freezesLeft - 1 };
    }
    case 'UNLOCK_BADGE':
        if (state.unlockedBadges.includes(action.badgeId)) return state;
        return { ...state, unlockedBadges: [...state.unlockedBadges, action.badgeId] };
    case 'UPDATE_PROFILE':
        return { ...state, userName: action.userName, gender: action.gender };
    case 'RESET':
      return initial;
    default:
      return state;
  }
}

const Ctx = createContext<{ 
    state: State; 
    dispatch: React.Dispatch<Action>; 
    multiplier: number;
    xpForNextLevel: number;
    progressToNextLevel: number;
} | null>(null);

const GAMIFICATION_STORAGE_KEY = 'starlink_gamification_v1';

export function GamificationProvider({ 
  children, 
  initialState 
}: { 
  children: React.ReactNode; 
  initialState?: State;
}) {
  const [state, dispatch] = useReducer(reducer, initialState || initial, (defaultState) => {
    try {
      const stored = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultState;
    } catch {
      return defaultState;
    }
  });

  // Persist state on change
  React.useEffect(() => {
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const multiplier = useMemo(() => {
    if (state.streakDays >= 14) return 2.0;
    if (state.streakDays >= 7) return 1.5;
    if (state.streakDays >= 3) return 1.2;
    return 1.0;
  }, [state.streakDays]);

  const progressInfo = useMemo(() => {
    const currentLevelXp = xpForLevel(state.level);
    const nextLevelXp = xpForLevel(state.level + 1);
    const totalNeeded = nextLevelXp - currentLevelXp;
    const progressXp = state.xp - currentLevelXp;
    const progress = Math.min(100, Math.round((progressXp / totalNeeded) * 100));
    const toNext = nextLevelXp - state.xp;
    
    return {
        xpForNextLevel: Math.max(0, toNext),
        progressToNextLevel: Math.max(0, progress)
    };
  }, [state.xp, state.level]);

  const value = useMemo(() => ({ 
    state, 
    dispatch, 
    multiplier,
    ...progressInfo
  }), [state, multiplier, progressInfo]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGamification() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
