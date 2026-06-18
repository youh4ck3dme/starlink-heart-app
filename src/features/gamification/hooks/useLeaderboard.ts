import { useEffect, useState } from 'react';
import { LeaderboardService, LeaderboardEntry, LeaderboardScope } from '../services/LeaderboardService';

export function useLeaderboard(scope: LeaderboardScope = 'global') {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = LeaderboardService.subscribeLeaderboard(scope, (entries, currentUserEntry) => {
      setLeaderboard(entries);
      setUserEntry(currentUserEntry);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [scope]);

  return { leaderboard, userEntry, loading };
}
