import { useState, useEffect } from 'react';
import { LeaderboardService, LeaderboardEntry, LeaderboardScope } from '../services/LeaderboardService';

export function useLeaderboard(scope: LeaderboardScope = 'global') {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await LeaderboardService.getLeaderboard(scope);
        const user = await LeaderboardService.getUserRank('current-user');
        
        if (isMounted) {
            setLeaderboard(data);
            setUserEntry(user || null);
        }
      } catch (e) {
        console.error("Failed to fetch leaderboard", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [scope]);

  return { leaderboard, userEntry, loading };
}
