import { useEffect } from 'react';
import { useGamification } from '../context/GamificationContext';

/**
 * Jednoduchý streak tick – volaj pri dennom logine / dokončení prvej misie.
 */
export function useDailyStreakTick(enabled: boolean) {
  const { dispatch } = useGamification();
  useEffect(() => {
    if (!enabled) return;
    const key = 'sh:lastTick';
    const today = new Date().toDateString();
    const last = localStorage.getItem(key);
    if (last !== today) {
      dispatch({ type: 'TICK_STREAK' });
      localStorage.setItem(key, today);
    }
  }, [enabled, dispatch]);
}
