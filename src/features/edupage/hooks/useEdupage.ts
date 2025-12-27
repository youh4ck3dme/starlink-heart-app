import { useState, useCallback } from 'react';
import { SchoolSnapshot } from '../../../core/types/schoolSystem';

interface UseEdupageResult {
  snapshot: SchoolSnapshot | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, ebuid: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<void>;
}

/**
 * React hook for EduPage integration (Deep Cleaned - simplified to view-only mode)
 */
export function useEdupage(): UseEdupageResult {
  const [snapshot, setSnapshot] = useState<SchoolSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simplified logic - no real client/scraping
  const login = useCallback(async (username: string, password: string, ebuid: string): Promise<boolean> => {
     // Always fail/ignore for now as per deep clean request
     console.warn("EduPage login removed in Deep Clean");
     setError("Prihlasovanie bolo dočasne vypnuté pre zjednodušenie aplikácie.");
     return false;
  }, []);

  const logout = useCallback(() => {
    setSnapshot(null);
    setIsAuthenticated(false);
  }, []);

  const refresh = useCallback(async () => {
    // No-op
  }, []);

  return {
    snapshot,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refresh,
  };
}
