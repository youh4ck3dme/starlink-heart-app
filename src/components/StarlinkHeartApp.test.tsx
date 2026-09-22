import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StarlinkHeartApp from './StarlinkHeartApp';
import { GamificationProvider } from '../features/gamification/context/GamificationContext';

vi.mock('../services/localService', () => ({
  onSnapshot: vi.fn(() => () => {}),
  query: vi.fn(),
  collection: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  startAfter: vi.fn(),
  getDocs: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  serverTimestamp: vi.fn(),
  db: {},
  storage: {},
}));

vi.mock('../services/geminiService', () => ({
  getStarryTip: vi.fn(),
  generateCosmicResponse: vi.fn(),
  generateCosmicHint: vi.fn(),
  generateParentGuide: vi.fn(),
}));

vi.mock('../services/consentService', () => ({
  hasParentConsent: vi.fn().mockReturnValue(true),
  setParentConsent: vi.fn(),
  clearAllAppData: vi.fn(),
}));

vi.mock('../hooks/useVoiceMode', () => ({
  useVoiceMode: () => ({
    isSupported: true,
    isEnabled: false,
    isListening: false,
    isSpeaking: false,
    toggleVoiceMode: vi.fn(),
    startListening: vi.fn(),
    stopListening: vi.fn(),
    speak: vi.fn(),
    stopSpeaking: vi.fn(),
  }),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('./layout/LiveStarryBackground', () => ({ default: () => <div /> }));
vi.mock('./mascot/MascotRenderer', () => ({
  default: () => <div data-testid="mascot-renderer" />,
  MascotMode: {},
}));
vi.mock('./screens/DashboardScreen', () => ({
  default: () => <div data-testid="dashboard-screen">Dashboard</div>,
}));

describe('StarlinkHeartApp intro layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders a full-viewport centered intro start control', () => {
    render(
      <GamificationProvider>
        <MemoryRouter>
          <StarlinkHeartApp />
        </MemoryRouter>
      </GamificationProvider>
    );

    const startBtn = screen.getByRole('button', { name: /Start App|ŠTART|Začať/i });
    expect(startBtn).toBeInTheDocument();

    // Intro uses min-h-dvh + flex centering on the IntroScreen root.
    const introRoot = startBtn.closest('.min-h-dvh') ?? startBtn.closest('[class*="min-h"]');
    expect(introRoot).toBeTruthy();
    expect(introRoot?.className).toMatch(/items-center/);
    expect(introRoot?.className).toMatch(/justify-center/);
  });
});
