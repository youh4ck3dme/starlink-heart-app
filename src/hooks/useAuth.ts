import { useState, useEffect, useCallback } from 'react';

interface AuthError {
  message: string;
}

interface SignInResult {
  error: AuthError | null;
  mfaRequired?: boolean;
}

interface SignUpResult {
  error: AuthError | null;
}

interface MfaResult {
  error: AuthError | null;
}

interface MfaChallenge {
  factorId: string;
}

// Simple auth state - in production use Firebase/Supabase
const AUTH_KEY = 'starlink_auth_user';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null);
  const [user, setUser] = useState<{ email: string; displayName: string } | null>(null);

  // Check auth state on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Demo: accept any valid-looking credentials
    if (email && password.length >= 6) {
      const userData = { email, displayName: email.split('@')[0] };
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { error: null };
    }

    return { error: { message: 'Invalid login credentials' } };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<SignUpResult> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email && password.length >= 6 && displayName.length >= 2) {
      const userData = { email, displayName };
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { error: null };
    }

    return { error: { message: 'Invalid signup data' } };
  }, []);

  const verifyMfa = useCallback(async (code: string): Promise<MfaResult> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (code === '123456') {
      setMfaChallenge(null);
      setIsAuthenticated(true);
      return { error: null };
    }

    return { error: { message: 'Invalid MFA code' } };
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setMfaChallenge(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    mfaChallenge,
    signIn,
    signUp,
    signOut,
    verifyMfa,
  };
}
