import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StarlinkHeartApp from '../components/StarlinkHeartApp';

// Mock Services
vi.mock('../services/localService', () => ({
  onSnapshot: vi.fn((q, cb) => {
      // Simulate generic snapshot if needed, or just return unsubscribe
      return () => {};
  }),
  query: vi.fn(),
  collection: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  startAfter: vi.fn(),
  getDocs: vi.fn(),
  db: {},
  storage: {}
}));

// Mock Complex Screens to avoid Canvas/3D issues in JSDOM
vi.mock('../components/screens/DashboardScreen', () => {
    const React = require('react');
    return { default: () => React.createElement('div', { 'data-testid': 'dashboard-screen' }, 'Nová Misia') }; 
});

vi.mock('../services/geminiService', () => ({
  getStarryTip: vi.fn(),
  generateCosmicResponse: vi.fn(),
  generateCosmicHint: vi.fn(),
  generateParentGuide: vi.fn(),
}));

vi.mock('../services/consentService', () => ({
  hasParentConsent: vi.fn().mockReturnValue(true),
  setParentConsent: vi.fn(),
  clearAllAppData: vi.fn()
}));

vi.mock('../services/xpService', () => ({
  getPlayerStats: vi.fn().mockReturnValue({ level: 1, xp: 0, title: 'Novice' })
}));

vi.mock('../hooks/useVoiceMode', () => ({
  useVoiceMode: () => ({ isSupported: true, isEnabled: false, toggleVoiceMode: vi.fn() })
}));

// Mock Complex Child Components to avoid rendering issues
vi.mock('../components/layout/LiveStarryBackground', () => ({ default: () => <div /> }));
vi.mock('../components/mascot/MascotRenderer', () => ({ default: () => <div /> }));

// Intro Screen relies on IntroScreen component
// We can let it render or verify StarlinkHeartApp renders it.
// StarlinkHeartApp checks viewMode === 'intro'.

describe('StarlinkHeartApp Intro', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders intro screen initially', async () => {
        render(
            <MemoryRouter>
                <StarlinkHeartApp />
            </MemoryRouter>
        );

        // Expect Start button from IntroScreen
        expect(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i })).toBeInTheDocument();
        // Expect Logo or Title
        expect(screen.getByAltText(/Starlink Heart/i)).toBeInTheDocument();
    });

    it('transitions to Dashboard on Start', async () => {
        render(
            <MemoryRouter>
                <StarlinkHeartApp />
            </MemoryRouter>
        );

        const startBtn = screen.getByRole('button', { name: /Start App|ŠTART|Začať/i });
        fireEvent.click(startBtn);

        // Wait for Dashboard element
        await waitFor(() => {
            // Check for the dashboard screen specifically
            expect(screen.getByTestId('dashboard-screen')).toBeInTheDocument();
            // Or use more specific text query if needed
            // expect(screen.getAllByText(/Nová Misia/i)[0]).toBeInTheDocument();
        });
    });
});
