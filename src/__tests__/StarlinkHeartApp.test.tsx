import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import StarlinkHeartApp from '../components/StarlinkHeartApp';
import * as consentService from '../services/consentService';

// --- MOCKS ---

// Mock Services
vi.mock('../services/localService', () => ({
  onSnapshot: (_: any, cb: any) => {
    // Simulate initial data load
    cb({ docs: [] });
    return () => {}; // Unsubscribe mock
  },
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

vi.mock('../services/geminiService', () => ({
  getStarryTip: vi.fn().mockResolvedValue('Tip of the day!'),
  generateCosmicResponse: vi.fn().mockResolvedValue({ textResponse: 'Cosmic hello!', visualAids: [] }),
}));

vi.mock('../services/consentService', () => ({
  hasParentConsent: vi.fn().mockReturnValue(true), // Default to true
  setParentConsent: vi.fn(),
  clearAllAppData: vi.fn()
}));

vi.mock('../services/xpService', () => ({
  getPlayerStats: vi.fn().mockReturnValue({ level: 1, xp: 0, title: 'Novice' })
}));

vi.mock('../hooks/useVoiceMode', () => ({
  useVoiceMode: () => ({ isSupported: true, isEnabled: false, toggleVoiceMode: vi.fn() })
}));

// Mock Complex Child Components
vi.mock('../components/layout/LiveStarryBackground', () => {
    const React = require('react');
    return { default: () => React.createElement('div', { 'data-testid': 'live-bg' }) };
});
vi.mock('../components/mascot/MascotRenderer', () => {
    const React = require('react');
    return { default: () => React.createElement('div', { 'data-testid': 'mascot' }) };
});
// Simplify ChatView to allow interaction with passed props if needed, or just existence
vi.mock('../components/chat/ChatView', () => {
    const React = require('react');
    return { default: () => React.createElement('div', { 'data-testid': 'chat-view' }, 'Chat View Content') };
});
// Mock Complex Screens to avoid Canvas/3D issues in JSDOM
vi.mock('../components/screens/DashboardScreen', () => {
    const React = require('react');
    return { default: (props: any) => React.createElement('div', { 'data-testid': 'dashboard-screen' }, 
        React.createElement('button', { 'data-testid': 'start-mission-btn', onClick: props.onNewMission }, 'Nová Misia'), // Mock content needed for nav test
        React.createElement('button', { 'data-testid': 'profile-btn', onClick: props.onProfile }, 'Profile'), // Mock profile btn
        React.createElement('button', { 'data-testid': 'open-settings-btn', onClick: props.onCenter }, 'Centrum'), // Mock settings btn with text matching test
        React.createElement('button', { onClick: props.onCoachToggle }, props.isCoachMode ? 'Kouč: ON' : 'Kouč: OFF') // Mock coach btn
    ) };
});

vi.mock('../components/screens/SchoolDashboard', () => {
    const React = require('react');
    return { default: () => React.createElement('div', { 'data-testid': 'school-dashboard' }, 'School Dashboard') };
});

// Mock Camera Modal
vi.mock('../components/camera/CameraModal', () => {
    const React = require('react');
    return { default: ({ isOpen }: any) => isOpen ? React.createElement('div', { 'data-testid': 'camera-modal' }, 'Camera') : null };
});

describe('StarlinkHeartApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const navigateToDashboard = async () => {
    render(
      <MemoryRouter>
        <StarlinkHeartApp />
      </MemoryRouter>
    );
    const startBtn = screen.getByRole('button', { name: /Start App|ŠTART|Začať/i });
    fireEvent.click(startBtn);
    // Wait for Dashboard animation to complete
    await screen.findByTestId('start-mission-btn');
  };

  it('navigates full flow: Intro -> Dashboard -> Chat', async () => {
    await navigateToDashboard();

    // Check Dashboard
    const dashboard = await screen.findByTestId('dashboard-screen');
    expect(dashboard).toBeInTheDocument();

    const newMissionBtn = await screen.findByTestId('start-mission-btn');
    expect(newMissionBtn).toBeInTheDocument();

    // Go to Chat
    fireEvent.click(newMissionBtn);
    await waitFor(() => {
      expect(screen.getByTestId('chat-view')).toBeInTheDocument();
    });
  });

  it('opens and closes Profile Modal', async () => {
    await navigateToDashboard();
    
    // Open Profile via header button
    const profileBtn = screen.getByTestId('profile-btn');
    fireEvent.click(profileBtn);
    
    await waitFor(() => {
        expect(screen.getByText(/Prieskumník Vesmíru/i)).toBeInTheDocument();
    });

    // Close Profile
    const closeBtn = screen.getByText(/Zatvoriť/i);
    fireEvent.click(closeBtn);
    
    await waitFor(() => {
        expect(screen.queryByText(/Prieskumník Vesmíru/i)).not.toBeInTheDocument();
    });
  });

  it('opens and closes Settings (Centrum) Modal', async () => {
    await navigateToDashboard();
    
    // Open Settings
    const centerBtn = screen.getByText(/Centrum/i);
    fireEvent.click(centerBtn);
    
    await waitFor(() => {
        expect(screen.getByText(/Vzhľad a Téma/i)).toBeInTheDocument();
    });
    
    // Close Settings
    const closeBtn = screen.getByRole('button', { name: /×/i }); // Close 'x' button
    fireEvent.click(closeBtn);
    
    await waitFor(() => {
        expect(screen.queryByText(/Vzhľad a Téma/i)).not.toBeInTheDocument();
    });
  });

  it('toggles Coach Mode', async () => {
    await navigateToDashboard();
    
    const coachBtn = screen.getByText(/Kouč: OFF/i); // New layout text
    fireEvent.click(coachBtn);
    
    await waitFor(() => {
        expect(screen.getByText(/Kouč: ON/i)).toBeInTheDocument();
    });
  });

  it('handles Parent Consent flow', () => {
    // Override mock for this test
    (consentService.hasParentConsent as any).mockReturnValue(false);
    
    // For now, let's just ensure basic render doesn't crash with no consent
    render(
      <MemoryRouter>
        <StarlinkHeartApp />
      </MemoryRouter>
    );
  });
});
