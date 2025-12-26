import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StarlinkHeartApp from '../components/StarlinkHeartApp';

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
    MascotMode: { STAR: 'star', RIVE: 'rive', IMAGE: 'image' }
}));

vi.mock('../components/layout/LiveStarryBackground', () => ({
    default: () => <div data-testid="live-background" />
}));

// Mock DashboardScreen to avoid Canvas/3D issues in JSDOM and provide reliable buttons
vi.mock('../components/screens/DashboardScreen', () => {
    const React = require('react');
    return { 
        default: (props: any) => React.createElement('div', { 'data-testid': 'dashboard-screen' },
            React.createElement('button', { 'data-testid': 'start-mission-btn', onClick: props.onNewMission }, 'Nová Misia'),
            React.createElement('button', { 'data-testid': 'open-settings-btn', onClick: props.onCenter }, 'Centrum'),
            // Voice button is usually in Header or Dashboard, here we just ensure 'Hlasový vstup' label exists if it's in dashboard
            // But test looks for 'Hlasový vstup' label. In the app code, it might be the header or dashboard.
            // StarlinkHeartApp renders Header. Header has "Hlasový vstup"?
            // Let's verify if 'Hlasový vstup' is in DashboardScreen or Header.
            // Assuming Header since StarlinkHeartApp renders it.
        )
    };
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Gem Shop Features', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('hasStarted', 'true');
        // Unlock defaults if needed (Starry is default)
    });

    const navigateToCustomizeModal = async () => {
        render(
            <MemoryRouter>
                <StarlinkHeartApp />
            </MemoryRouter>
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

    it('displays avatar prices in customize modal', async () => {
        await navigateToCustomizeModal();
        expect(screen.getByText('💎20')).toBeInTheDocument();
        expect(screen.getByText('💎50')).toBeInTheDocument();
    });

    it('displays background prices in customize modal', async () => {
        await navigateToCustomizeModal();
        expect(screen.getByText('💎60')).toBeInTheDocument();
        expect(screen.getByText('💎120')).toBeInTheDocument();
    });

    it('shows gem count in customize modal header', async () => {
        localStorage.setItem('starryGems', '150');
        await navigateToCustomizeModal();
        expect(screen.getByText('💎 150')).toBeInTheDocument();
    });

    it('first avatar (Starry) is unlocked by default', async () => {
        await navigateToCustomizeModal();
        const starryButton = screen.getByText('Starry').closest('button');
        expect(starryButton).not.toHaveClass('opacity-75'); // Not locked/dimmed
    });

    it('locked avatars show grayscale effect', async () => {
        await navigateToCustomizeModal();
        const cometaButton = screen.getByText('Cometa').closest('button');
        // Check for class that indicates locked state (bg-gray-100 opacity-75)
        expect(cometaButton).toHaveClass('opacity-75');
    });

    it('cannot select locked avatar without enough gems', async () => {
        localStorage.setItem('starryGems', '10'); 
        await navigateToCustomizeModal();
        
        const cometaButton = screen.getByText('Cometa').closest('button');
        fireEvent.click(cometaButton!);
        
        const starryButton = screen.getByText('Starry').closest('button');
        expect(starryButton).toHaveClass('ring-sky-500'); // Still selected
    });

    it('can purchase avatar with enough gems', async () => {
        localStorage.setItem('starryGems', '100');
        await navigateToCustomizeModal();
        
        const cometaButton = screen.getByText('Cometa').closest('button');
        fireEvent.click(cometaButton!);
        
        await waitFor(() => {
            expect(cometaButton).toHaveClass('ring-sky-500');
        });
    });

    it('unlocked items persist in localStorage', async () => {
        localStorage.setItem('starryGems', '100');
        await navigateToCustomizeModal();
        
        const cometaButton = screen.getByText('Cometa').closest('button');
        fireEvent.click(cometaButton!);
        
        await waitFor(() => {
            const unlocked = JSON.parse(localStorage.getItem('unlockedAvatars') || '[]');
            expect(unlocked).toContain('☄️');
        });
    });

    it('deducts gems after purchase', async () => {
        localStorage.setItem('starryGems', '100');
        await navigateToCustomizeModal();
        
        const cometaButton = screen.getByText('Cometa').closest('button');
        fireEvent.click(cometaButton!);
        
        await waitFor(() => {
            const gems = localStorage.getItem('starryGems');
            expect(gems).toBe('80');
        });
    });
});

describe('Voice Mode UI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('hasStarted', 'true');
    });

    it('shows microphone button when voice mode is enabled and supported', async () => {
        render(
            <MemoryRouter>
                <StarlinkHeartApp />
            </MemoryRouter>
        );
        
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        const newMissionBtn = await screen.findByTestId('start-mission-btn');
        fireEvent.click(newMissionBtn);
        
        // Mic button is in Chat Input usually, which appears after New Mission -> Chat
        const micBtn = await screen.findByLabelText('Hlasový vstup');
        expect(micBtn).toBeInTheDocument();
    });

    it('mic button has correct styling', async () => {
        render(
            <MemoryRouter>
                <StarlinkHeartApp />
            </MemoryRouter>
        );
        
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        const newMissionBtn = await screen.findByTestId('start-mission-btn');
        fireEvent.click(newMissionBtn);
        
        const micBtn = await screen.findByLabelText('Hlasový vstup');
        // Expect bg-emerald-500 if enabled? 
        // Mock says isEnabled: true?
        // Wait, mock says: isEnabled: true. 
        // In app, class is `bg-emerald-500`.
        expect(micBtn).toHaveClass('bg-emerald-500');
    });
});
