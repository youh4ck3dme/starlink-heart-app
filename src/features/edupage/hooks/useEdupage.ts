import { useState, useEffect, useCallback } from 'react';
import { SchoolSnapshot, ISchoolSystemClient } from '../../../core/types/schoolSystem';
import { EdupageClient } from '../services/edupageClient';

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
 * React hook for EduPage integration
 */
export function useEdupage(): UseEdupageResult {
  const [client] = useState<ISchoolSystemClient>(() => new EdupageClient());
  const [snapshot, setSnapshot] = useState<SchoolSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    setIsAuthenticated(client.isAuthenticated());
    
    if (client.isAuthenticated()) {
      fetchSnapshot();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSnapshot = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await client.getSnapshot();
      setSnapshot(data);
      setIsAuthenticated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodarilo sa načítať dáta');
      if (!client.isAuthenticated()) {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (username: string, password: string, ebuid: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await client.login({ username, password, schoolId: ebuid });
      
      if (success) {
        setIsAuthenticated(true);
        await fetchSnapshot();
        return true;
      }
      
      setError('Nesprávne prihlasovacie údaje');
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Prihlásenie zlyhalo');
      return false;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const logout = useCallback(() => {
    client.logout();
    setSnapshot(null);
    setIsAuthenticated(false);
    setError(null);
  }, [client]);

  const refresh = useCallback(async () => {
    if (isAuthenticated) {
      await fetchSnapshot();
    }
  }, [isAuthenticated]);

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
