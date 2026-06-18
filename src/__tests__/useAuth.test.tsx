import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockSignInWithEmailAndPassword,
  mockCreateUserWithEmailAndPassword,
  mockUpdateProfile,
  mockSignInWithPopup,
  mockSendPasswordResetEmail,
  mockFirebaseSignOut,
  mockOnAuthStateChanged,
  mockGoogleAuthProvider,
  authMock,
} = vi.hoisted(() => ({
  mockSignInWithEmailAndPassword: vi.fn(),
  mockCreateUserWithEmailAndPassword: vi.fn(),
  mockUpdateProfile: vi.fn(),
  mockSignInWithPopup: vi.fn(),
  mockSendPasswordResetEmail: vi.fn(),
  mockFirebaseSignOut: vi.fn(),
  mockOnAuthStateChanged: vi.fn(),
  mockGoogleAuthProvider: vi.fn(),
  authMock: { currentUser: null as any },
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: mockGoogleAuthProvider,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  onAuthStateChanged: mockOnAuthStateChanged,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signInWithPopup: mockSignInWithPopup,
  signOut: mockFirebaseSignOut,
  updateProfile: mockUpdateProfile,
}));

vi.mock('../services/firebase', () => ({
  auth: authMock,
  isFirebaseConfigured: true,
}));

import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return vi.fn();
    });
  });

  it('updates auth state from onAuthStateChanged callback', async () => {
    const firebaseUser = { uid: 'u1', email: 'user@example.com' } as any;
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(firebaseUser);
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.uid).toBe('u1');
  });

  it('signIn calls firebase auth API and succeeds', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u2' } });
    const { result } = renderHook(() => useAuth());

    let response: any;
    await act(async () => {
      response = await result.current.signIn('kid@example.com', 'password123');
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(authMock, 'kid@example.com', 'password123');
    expect(response).toEqual({ error: null });
  });

  it('maps firebase auth error codes to user-friendly messages', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' });
    const { result } = renderHook(() => useAuth());

    let response: any;
    await act(async () => {
      response = await result.current.signIn('kid@example.com', 'wrong');
    });

    expect(response.error?.message).toBe('Neplatné prihlasovacie údaje.');
  });

  it('signUp creates user and updates profile', async () => {
    const createdUser = { uid: 'u3' };
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: createdUser });
    mockUpdateProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signUp('new@example.com', 'password123', 'New Kid');
    });

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(authMock, 'new@example.com', 'password123');
    expect(mockUpdateProfile).toHaveBeenCalledWith(createdUser, { displayName: 'New Kid' });
  });

  it('signInWithGoogle uses popup flow and maps popup errors', async () => {
    mockSignInWithPopup.mockRejectedValue({ code: 'auth/popup-blocked' });
    const { result } = renderHook(() => useAuth());

    let response: any;
    await act(async () => {
      response = await result.current.signInWithGoogle();
    });

    expect(mockGoogleAuthProvider).toHaveBeenCalledTimes(1);
    expect(mockSignInWithPopup).toHaveBeenCalledWith(authMock, expect.anything());
    expect(response.error?.message).toBe('Google prihlásenie bolo zablokované prehliadačom.');
  });

  it('resetPassword calls firebase reset API', async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.resetPassword('kid@example.com');
    });

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(authMock, 'kid@example.com');
  });
});
