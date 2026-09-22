import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockCollection,
  mockDoc,
  mockGetDoc,
  mockGetDocs,
  mockLimit,
  mockOnSnapshot,
  mockOrderBy,
  mockQuery,
  mockServerTimestamp,
  mockSetDoc,
  authMock,
  dbMock,
} = vi.hoisted(() => ({
  mockCollection: vi.fn(),
  mockDoc: vi.fn(),
  mockGetDoc: vi.fn(),
  mockGetDocs: vi.fn(),
  mockLimit: vi.fn((n) => ({ __limit: n })),
  mockOnSnapshot: vi.fn(),
  mockOrderBy: vi.fn((field, dir) => ({ __orderBy: [field, dir] })),
  mockQuery: vi.fn((_col, ...constraints) => ({ __constraints: constraints })),
  mockServerTimestamp: vi.fn(() => 'SERVER_TS'),
  mockSetDoc: vi.fn(),
  authMock: { currentUser: { uid: 'user-1', email: 'cadet@example.com', displayName: 'Cadet' } as any },
  dbMock: { __db: true },
}));

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  limit: mockLimit,
  onSnapshot: mockOnSnapshot,
  orderBy: mockOrderBy,
  query: mockQuery,
  serverTimestamp: mockServerTimestamp,
  setDoc: mockSetDoc,
}));

vi.mock('../services/firebase', () => ({
  auth: authMock,
  db: dbMock,
}));

import { LeaderboardService } from '../features/gamification/services/LeaderboardService';

describe('LeaderboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockCollection.mockReturnValue({ __collection: true });
    mockDoc.mockReturnValue({ __doc: true });
  });

  it('maps real-time snapshot to ranked leaderboard and picks current user entry', () => {
    mockOnSnapshot.mockImplementation((_q, onNext) => {
      onNext({
        docs: [
          { id: 'user-1', data: () => ({ nickname: 'Cadet', avatar: '⭐', score: 900, badges: ['A'], trend: 'up' }) },
          { id: 'user-2', data: () => ({ nickname: 'Nova', avatar: '🤖', score: 800, badges: [], trend: 'same' }) },
        ],
      });
      return vi.fn();
    });

    const updates: any[] = [];
    const unsubscribe = LeaderboardService.subscribeLeaderboard('global', (entries, userEntry) => {
      updates.push({ entries, userEntry });
    });

    expect(mockCollection).toHaveBeenCalled();
    expect(updates[0].entries[0].rank).toBe(1);
    expect(updates[0].entries[1].rank).toBe(2);
    expect(updates[0].userEntry.id).toBe('user-1');
    expect(typeof unsubscribe).toBe('function');
  });

  it('falls back to predefined leaderboard when snapshot errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnSnapshot.mockImplementation((_q, _onNext, onError) => {
      onError(new Error('network'));
      return vi.fn();
    });

    const updates: any[] = [];
    LeaderboardService.subscribeLeaderboard('global', (entries, userEntry) => {
      updates.push({ entries, userEntry });
    });

    expect(updates[0].entries.length).toBeGreaterThan(0);
    expect(updates[0].entries[0].rank).toBe(1);
    expect(updates[0].userEntry).not.toBeNull();
    errorSpy.mockRestore();
  });

  it('writes current user score with up trend when score increased', async () => {
    localStorage.setItem('starlink_gamification_v1', JSON.stringify({
      xp: 800,
      level: 7,
      streakDays: 5,
      unlockedBadges: ['xp-100'],
      userName: 'Cadet',
      gender: 'unspecified',
    }));
    localStorage.setItem('starlink_daily_missions', JSON.stringify([
      { completed: true },
      { completed: true },
      { completed: false },
    ]));

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ score: 100 }),
    });

    const result = await LeaderboardService.recordCurrentUserScore('global');

    expect(mockSetDoc).toHaveBeenCalledWith(
      { __doc: true },
      expect.objectContaining({
        id: 'user-1',
        userId: 'user-1',
        nickname: 'Cadet',
        trend: 'up',
        updatedAt: 'SERVER_TS',
      }),
      { merge: true }
    );
    expect(result?.trend).toBe('up');
    expect(result?.id).toBe('user-1');
  });
});
