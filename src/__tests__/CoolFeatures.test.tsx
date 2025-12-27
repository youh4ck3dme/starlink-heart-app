import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StarlinkHeartApp from '../components/StarlinkHeartApp';
import { GamificationProvider } from '../features/gamification/context/GamificationContext';

// Mock dependencies
vi.mock('../services/geminiService', () => ({
    generateCosmicResponse: vi.fn(),
    getStarryTip: vi.fn(),
    generateCosmicHint: vi.fn(),
    generateParentGuide: vi.fn(),
}));

vi.mock('../services/localService', () => ({
    db: {},
    storage: {},
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    onSnapshot: vi.fn((q: any, cb: any) => {
        cb({ docs: [] });
        return () => {};
    }),
    addDoc: vi.fn(),
    serverTimestamp: vi.fn(),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
}));

vi.mock('../services/consentService', () => ({
    hasParentConsent: vi.fn(() => true),
    setParentConsent: vi.fn(),
    clearAllAppData: vi.fn(),
}));

vi.mock('../hooks/useVoiceMode', () => ({
    useVoiceMode: () => ({
        isListening: false,
        isSpeaking: false,
        isEnabled: true,
        isSupported: true,
        startListening: vi.fn(),
        stopListening: vi.fn(),
        speak: vi.fn(),
        stopSpeaking: vi.fn(),
        toggleVoiceMode: vi.fn(),
    }),
}));

vi.mock('../components/mascot/MascotRenderer', () => ({
    default: () => <div data-testid="mascot-renderer">Mascot</div>,
}));

vi.mock('../components/layout/LiveStarryBackground', () => ({
    default: () => <div data-testid="live-background" />
}));

vi.mock('../components/screens/DashboardScreen', () => {
    const React = require('react');
    return { 
        default: (props: any) => React.createElement('div', { 'data-testid': 'dashboard-screen' },
            React.createElement('button', { 'data-testid': 'start-mission-btn', onClick: props.onNewMission }, 'Nová Misia'),
            React.createElement('button', { 'data-testid': 'open-settings-btn', onClick: props.onCenter }, 'Centrum'),
        )
    };
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Theme and Progression UI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('hasStarted', 'true');
    });

    const navigateToCustomizeModal = async (initialState?: any) => {
        render(
            <GamificationProvider initialState={initialState}>
                <MemoryRouter>
                    <StarlinkHeartApp />
                </MemoryRouter>
            </GamificationProvider>
        );
        
        // Click Start
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        
        // Wait for Dashboard and click Settings (Centrum)
        const centrumBtn = await screen.findByTestId('open-settings-btn');
        fireEvent.click(centrumBtn);
        
        // Wait for modal
        await waitFor(() => {
            expect(screen.getByText('Vzhľad a Téma')).toBeInTheDocument();
        });
    };

    it('displays Level requirements for avatars in customize modal', async () => {
        await navigateToCustomizeModal({ level: 1 });
        // The indicators show "L6" and "L11"
        expect(screen.getByText(/L6/i)).toBeInTheDocument();
        expect(screen.getByText(/L11/i)).toBeInTheDocument();
    });

    it('shows level title in customize modal header', async () => {
        await navigateToCustomizeModal({ level: 5 });
        // Level 5 title check
        expect(screen.getByText(/Vesmírny Génius/i)).toBeInTheDocument();
    });

    it('starter avatar (Robo) is active at level 1', async () => {
        await navigateToCustomizeModal({ level: 1 });
        expect(screen.getByText('Robo')).toBeInTheDocument();
    });
});
