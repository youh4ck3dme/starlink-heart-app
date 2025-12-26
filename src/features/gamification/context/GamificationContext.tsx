import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { BADGES } from '../config/badges';
import { playSound } from '../../../utils/sound'; // Sound feedback for badges

type State = {
  xp: number;
  level: number;
  streakDays: number;
  freezesLeft: number;
  unlockedBadges: string[];
};

const initial: State = { xp: 0, level: 1, streakDays: 0, freezesLeft: 3, unlockedBadges: [] };

type Action =
  | { type: 'GAIN_XP'; amount: number }
  | { type: 'TICK_STREAK' }
  | { type: 'FREEZE_STREAK' }
  | { type: 'RESET' }
  | { type: 'UNLOCK_BADGE'; badgeId: string };

function levelFor(xp: number) {
  // Upravená krivka: Pomalší rast, aby levely nelietali
  // Level 1 = 0-99 XP
  // Level 2 = 100 XP
  // Level 10 = ~2500 XP
  return Math.floor(1 + Math.sqrt(xp) / 5); 
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
    case 'RESET':
      return initial;
    default:
      return state;
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action>; multiplier: number } | null>(null);

const GAMIFICATION_STORAGE_KEY = 'starlink_gamification_v1';

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, (defaultState) => {
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

  const value = useMemo(() => ({ state, dispatch, multiplier }), [state, multiplier]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGamification() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
