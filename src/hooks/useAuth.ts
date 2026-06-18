import { useCallback, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';

interface AuthError {
  message: string;
}

interface AuthResult {
  error: AuthError | null;
}

const toAuthError = (error: unknown): AuthError => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: string }).code);
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return { message: 'Neplatné prihlasovacie údaje.' };
      case 'auth/email-already-in-use':
        return { message: 'Tento email je už zaregistrovaný.' };
      case 'auth/weak-password':
        return { message: 'Heslo musí mať aspoň 6 znakov.' };
      case 'auth/popup-closed-by-user':
        return { message: 'Prihlásenie cez Google bolo zrušené.' };
      case 'auth/popup-blocked':
        return { message: 'Google prihlásenie bolo zablokované prehliadačom.' };
      case 'auth/operation-not-allowed':
        return { message: 'Firebase Auth nie je pre tento projekt nakonfigurovaný.' };
      default:
        return { message: 'Prihlásenie zlyhalo. Skúste to znova.' };
    }
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Prihlásenie zlyhalo. Skúste to znova.' };
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setIsAuthenticated(Boolean(nextUser));
        setIsLoading(false);
      },
      () => {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!auth) {
      return { error: { message: 'Firebase Auth nie je nakonfigurovaný.' } };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: toAuthError(error) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<AuthResult> => {
    if (!auth) {
      return { error: { message: 'Firebase Auth nie je nakonfigurovaný.' } };
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      return { error: null };
    } catch (error) {
      return { error: toAuthError(error) };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!auth) {
      return { error: { message: 'Firebase Auth nie je nakonfigurovaný.' } };
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (error) {
      return { error: toAuthError(error) };
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!auth) {
      return { error: { message: 'Firebase Auth nie je nakonfigurovaný.' } };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: toAuthError(error) };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    signOut,
    isFirebaseConfigured,
  };
}
