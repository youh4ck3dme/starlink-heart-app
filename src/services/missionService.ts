import { db } from './localService';

export type MissionType = 'PHOTO_TAKEN' | 'MESSAGE_SENT' | 'OPEN_APP';

export interface Mission {
    id: string;
    type: MissionType;
    label: string;
    target: number;
    progress: number;
    completed: boolean;
    reward: number; // Gems
}

const MISSIONS_KEY = 'starlink_daily_missions';
const LAST_LOGIN_KEY = 'starlink_last_login_date';

// Default missions pool
const MISSION_TEMPLATES: Omit<Mission, 'id' | 'progress' | 'completed'>[] = [
    { type: 'MESSAGE_SENT', label: 'Pošli 3 správy Starrymu', target: 3, reward: 10 },
    { type: 'PHOTO_TAKEN', label: 'Urob 1 vesmírnu fotku', target: 1, reward: 15 },
    { type: 'MESSAGE_SENT', label: 'Pošli 5 správ Starrymu', target: 5, reward: 20 },
    { type: 'OPEN_APP', label: 'Návrat kadeta (Otvorenie)', target: 1, reward: 5 },
];

export const getDailyMissions = (): Mission[] => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(LAST_LOGIN_KEY);
    const savedMissions = localStorage.getItem(MISSIONS_KEY);

    // New day = New missions
    if (savedDate !== today) {
        const newMissions = generateDailyMissions();
        saveMissions(newMissions);
        localStorage.setItem(LAST_LOGIN_KEY, today);
        return newMissions;
    }

    if (savedMissions) {
        return JSON.parse(savedMissions);
    }

    // Fallback
    const initial = generateDailyMissions();
    saveMissions(initial);
    return initial;
};

const generateDailyMissions = (): Mission[] => {
    // Pick 3 random unique missions (simplified for now: fixed set)
    // In a real app, we'd shuffle MISSION_TEMPLATES
    
    // Let's just pick: 1 simple message, 1 photo, 1 "open app" (auto completes)
    const mission1 = { ...MISSION_TEMPLATES[0], id: `m_${Date.now()}_1`, progress: 0, completed: false };
    const mission2 = { ...MISSION_TEMPLATES[1], id: `m_${Date.now()}_2`, progress: 0, completed: false };
    
    return [mission1, mission2];
};

export const saveMissions = (missions: Mission[]) => {
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
    // Dispatch event for UI updates
    window.dispatchEvent(new Event('missions-updated'));
};

export const incrementMissionProgress = (type: MissionType) => {
    const missions = getDailyMissions();
    let changed = false;

    const updated = missions.map(m => {
        if (m.type === type && !m.completed) {
            const newProgress = Math.min(m.progress + 1, m.target);
            if (newProgress !== m.progress) {
                changed = true;
                // Auto-complete check? No, let user claim manually or auto-claim?
                // Visual feedback usually requires manual claim, but let's just mark ready
                return { ...m, progress: newProgress };
            }
        }
        return m;
    });

    if (changed) {
        saveMissions(updated);
    }
};

export const claimMissionReward = (missionId: string): number => {
    const missions = getDailyMissions();
    let reward = 0;

    const updated = missions.map(m => {
        if (m.id === missionId && !m.completed && m.progress >= m.target) {
            reward = m.reward;
            return { ...m, completed: true };
        }
        return m;
    });

    if (reward > 0) {
        saveMissions(updated);
    }
    return reward;
};
