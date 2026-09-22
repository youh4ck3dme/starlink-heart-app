import { beforeEach, describe, expect, it, vi } from 'vitest';

const { recordCurrentUserScoreMock } = vi.hoisted(() => ({
  recordCurrentUserScoreMock: vi.fn(),
}));

vi.mock('../features/gamification/services/LeaderboardService', () => ({
  LeaderboardService: {
    recordCurrentUserScore: recordCurrentUserScoreMock,
  },
}));

import { claimMissionReward, incrementMissionProgress } from '../services/missionService';

describe('missionService leaderboard side-effects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('starlink_last_login_date', new Date().toDateString());
    localStorage.setItem('starlink_daily_missions', JSON.stringify([
      {
        id: 'm_1',
        type: 'MESSAGE_SENT',
        label: 'Pošli 3 správy Starrymu',
        target: 3,
        progress: 0,
        completed: false,
        reward: 10,
      },
      {
        id: 'm_2',
        type: 'PHOTO_TAKEN',
        label: 'Urob 1 vesmírnu fotku',
        target: 1,
        progress: 1,
        completed: false,
        reward: 15,
      },
    ]));
  });

  it('calls leaderboard score recording when mission progress changes', () => {
    incrementMissionProgress('MESSAGE_SENT');
    expect(recordCurrentUserScoreMock).toHaveBeenCalledWith('global');
  });

  it('calls leaderboard score recording when reward is claimed', () => {
    const reward = claimMissionReward('m_2');
    expect(reward).toBe(15);
    expect(recordCurrentUserScoreMock).toHaveBeenCalledWith('global');
  });

  it('does not call leaderboard score recording when nothing changes', () => {
    const reward = claimMissionReward('missing');
    expect(reward).toBe(0);
    expect(recordCurrentUserScoreMock).not.toHaveBeenCalled();
  });
});
