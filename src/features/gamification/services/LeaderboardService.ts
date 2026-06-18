import { auth, db } from '../../../services/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { BADGES } from '../config/badges';
import { getAvatarForLevel } from '../context/GamificationContext';

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  rank: number;
  badges: string[];
  trend: 'up' | 'down' | 'same';
}

export type LeaderboardScope = 'class' | 'school' | 'global';

const WEIGHTS = {
  missions: 0.35,
  aiChallenges: 0.25,
  schoolGrades: 0.25,
  streak: 0.15,
};

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', nickname: 'Nova Explorer', avatar: '⭐', score: 950, rank: 1, badges: ['Star Student'], trend: 'same' },
  { id: '2', nickname: 'Cosmic Ray', avatar: '☄️', score: 890, rank: 2, badges: [], trend: 'up' },
  { id: '3', nickname: 'Robo Tech', avatar: '🤖', score: 850, rank: 3, badges: ['Math Whiz'], trend: 'down' },
  { id: '4', nickname: 'Galaxy Girl', avatar: '⭐', score: 720, rank: 4, badges: [], trend: 'up' },
  { id: '5', nickname: 'Astro Boy', avatar: '🤖', score: 680, rank: 5, badges: [], trend: 'same' },
];

type GamificationSnapshot = {
  xp: number;
  level: number;
  streakDays: number;
  unlockedBadges: string[];
  userName: string;
  gender: 'boy' | 'girl' | 'unspecified';
};

type MissionSnapshot = {
  completed: number;
  total: number;
};

function calculateScore(stats: {
  missionsCompleted: number;
  aiSuccessRate: number;
  gradeAverage: number;
  streakDays: number;
}): number {
  const missionScore = Math.min(stats.missionsCompleted * 50, 1000);
  const aiScore = stats.aiSuccessRate * 1000;
  const gradeScore = Math.max(0, (5 - stats.gradeAverage) * 250);
  const streakScore = Math.min(stats.streakDays * 50, 1000);

  return Math.floor(
    missionScore * WEIGHTS.missions +
    aiScore * WEIGHTS.aiChallenges +
    gradeScore * WEIGHTS.schoolGrades +
    streakScore * WEIGHTS.streak
  );
}

function getLeaderboardCollection(scope: LeaderboardScope) {
  if (!db) return null;
  return collection(db, 'leaderboards', scope, 'entries');
}

function readGamificationSnapshot(): GamificationSnapshot {
  try {
    const raw = localStorage.getItem('starlink_gamification_v1');
    if (!raw) {
      return {
        xp: 0,
        level: 1,
        streakDays: 0,
        unlockedBadges: [],
        userName: 'Kadet',
        gender: 'unspecified',
      };
    }

    const parsed = JSON.parse(raw) as Partial<GamificationSnapshot>;
    return {
      xp: Number(parsed.xp ?? 0),
      level: Number(parsed.level ?? 1),
      streakDays: Number(parsed.streakDays ?? 0),
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      userName: typeof parsed.userName === 'string' ? parsed.userName : 'Kadet',
      gender: parsed.gender === 'boy' || parsed.gender === 'girl' ? parsed.gender : 'unspecified',
    };
  } catch {
    return {
      xp: 0,
      level: 1,
      streakDays: 0,
      unlockedBadges: [],
      userName: 'Kadet',
      gender: 'unspecified',
    };
  }
}

function readMissionSnapshot(): MissionSnapshot {
  try {
    const raw = localStorage.getItem('starlink_daily_missions');
    if (!raw) return { completed: 0, total: 0 };
    const missions = JSON.parse(raw) as Array<{ completed?: boolean }>;
    return {
      completed: missions.filter((mission) => mission.completed).length,
      total: missions.length,
    };
  } catch {
    return { completed: 0, total: 0 };
  }
}

function deriveScorePayload() {
  const profile = readGamificationSnapshot();
  const missions = readMissionSnapshot();
  const badgeNames = BADGES
    .filter((badge) => profile.unlockedBadges.includes(badge.id))
    .map((badge) => badge.name);

  const score = calculateScore({
    missionsCompleted: missions.completed,
    aiSuccessRate: Math.min(1, 0.35 + profile.xp / 2000),
    gradeAverage: profile.level >= 11 ? 1.8 : profile.level >= 6 ? 2.5 : 3.8,
    streakDays: profile.streakDays,
  });

  return {
    nickname: profile.userName,
    avatar: getAvatarForLevel(profile.level),
    score,
    badges: badgeNames,
    trend: 'same' as const,
  };
}

function mapLeaderboardSnapshot(scope: LeaderboardScope, docs: Array<{ id: string; data: () => any }>): LeaderboardEntry[] {
  return docs.map((snapshot, index) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      nickname: typeof data.nickname === 'string' ? data.nickname : 'Kadet',
      avatar: typeof data.avatar === 'string' ? data.avatar : getAvatarForLevel(Number(data.level ?? 1)),
      score: Number(data.score ?? 0),
      rank: index + 1,
      badges: Array.isArray(data.badges) ? data.badges : [],
      trend: data.trend === 'up' || data.trend === 'down' || data.trend === 'same' ? data.trend : 'same',
    };
  });
}

function getFallbackLeaderboard(): LeaderboardEntry[] {
  return [...FALLBACK_LEADERBOARD]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export const LeaderboardService = {
  subscribeLeaderboard: (
    scope: LeaderboardScope,
    onUpdate: (entries: LeaderboardEntry[], userEntry: LeaderboardEntry | null) => void
  ) => {
    const collectionRef = getLeaderboardCollection(scope);
    if (!collectionRef) {
      const fallback = getFallbackLeaderboard();
      onUpdate(fallback, fallback[0] ?? null);
      return () => undefined;
    }

    const q = query(collectionRef, orderBy('score', 'desc'), limit(25));
    return onSnapshot(q, (snapshot) => {
      const entries = mapLeaderboardSnapshot(scope, snapshot.docs);
      const currentUserId = auth?.currentUser?.uid ?? null;
      const userEntry = currentUserId ? entries.find((entry) => entry.id === currentUserId) ?? null : null;
      onUpdate(entries, userEntry);
    }, (error) => {
      console.error('Failed to subscribe to leaderboard', error);
      const fallback = getFallbackLeaderboard();
      onUpdate(fallback, fallback[0] ?? null);
    });
  },

  getLeaderboard: async (scope: LeaderboardScope = 'global'): Promise<LeaderboardEntry[]> => {
    const collectionRef = getLeaderboardCollection(scope);
    if (!collectionRef) {
      return getFallbackLeaderboard();
    }

    const q = query(collectionRef, orderBy('score', 'desc'), limit(25));
    const snapshot = await getDocs(q);
    return mapLeaderboardSnapshot(scope, snapshot.docs);
  },

  getUserRank: async (userId: string): Promise<LeaderboardEntry | undefined> => {
    const collectionRef = getLeaderboardCollection('global');
    if (!collectionRef) {
      return getFallbackLeaderboard().find((entry) => entry.id === userId);
    }

    const entries = await LeaderboardService.getLeaderboard('global');
    return entries.find((entry) => entry.id === userId);
  },

  recordCurrentUserScore: async (scope: LeaderboardScope = 'global') => {
    if (!db || !auth?.currentUser) {
      return null;
    }

    const currentUser = auth.currentUser;
    const payload = deriveScorePayload();
    const docRef = doc(db, 'leaderboards', scope, 'entries', currentUser.uid);
    const previous = await getDoc(docRef);
    const previousScore = previous.exists() ? Number(previous.data()?.score ?? 0) : null;
    const trend = previousScore == null || payload.score === previousScore
      ? 'same'
      : payload.score > previousScore
        ? 'up'
        : 'down';

    await setDoc(docRef, {
      id: currentUser.uid,
      nickname: currentUser.displayName || currentUser.email?.split('@')[0] || payload.nickname,
      avatar: payload.avatar,
      score: payload.score,
      badges: payload.badges,
      trend,
      scope,
      userId: currentUser.uid,
      email: currentUser.email || null,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return {
      id: currentUser.uid,
      nickname: currentUser.displayName || currentUser.email?.split('@')[0] || payload.nickname,
      avatar: payload.avatar,
      score: payload.score,
      rank: 0,
      badges: payload.badges,
      trend,
    } satisfies LeaderboardEntry;
  },
};
