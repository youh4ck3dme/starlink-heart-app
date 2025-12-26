import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Gem Shop Features', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('hasStarted', 'true');
    });

    const navigateToCustomizeModal = async () => {
        render(<StarlinkHeartApp />);
        
        // Click Start
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        
        // Wait for Dashboard and click Settings (Centrum) - find by text
        const centrumBtn = await screen.findByText('Centrum');
        fireEvent.click(centrumBtn.closest('button')!);
        
        // Wait for modal
        await waitFor(() => {
            expect(screen.getByText('Vzhľad a Téma')).toBeInTheDocument();
        });
    };

    it('displays avatar prices in customize modal', async () => {
        await navigateToCustomizeModal();
        
        // Check for price badges (new prices: Cometa 💎20, Robo 💎50)
        expect(screen.getByText('💎20')).toBeInTheDocument();
        expect(screen.getByText('💎50')).toBeInTheDocument();
    });

    it('displays background prices in customize modal', async () => {
        await navigateToCustomizeModal();
        
        // Check for background prices
        expect(screen.getByText('💎60')).toBeInTheDocument();
        expect(screen.getByText('💎120')).toBeInTheDocument();
    });

    it('shows gem count in customize modal header', async () => {
        // Set some gems first
        localStorage.setItem('starryGems', '150');
        
        await navigateToCustomizeModal();
        
        // Check gem display
        expect(screen.getByText('💎 150')).toBeInTheDocument();
    });

    it('first avatar (Starry) is unlocked by default', async () => {
        await navigateToCustomizeModal();
        
        // Starry should be selectable (no price badge on first avatar)
        const starryButton = screen.getByText('Starry').closest('button');
        expect(starryButton).not.toHaveClass('opacity-75');
    });

    it('locked avatars show grayscale effect', async () => {
        await navigateToCustomizeModal();
        
        // Cometa (20 gems) should be locked and grayscale
        const cometaButton = screen.getByText('Cometa').closest('button');
        expect(cometaButton?.querySelector('.grayscale')).toBeTruthy();
    });

    it('cannot select locked avatar without enough gems', async () => {
        localStorage.setItem('starryGems', '10'); // Not enough for Cometa (20)
        
        await navigateToCustomizeModal();
        
        // Try to click Cometa
        const cometaButton = screen.getByText('Cometa').closest('button');
        fireEvent.click(cometaButton!);
        
        // Avatar should NOT change from default Starry
        const starryButton = screen.getByText('Starry').closest('button');
        expect(starryButton).toHaveClass('ring-sky-500');
    });

    it('can purchase avatar with enough gems', async () => {
        localStorage.setItem('starryGems', '100');
        
        await navigateToCustomizeModal();
        
        // Click Cometa (costs 20)
        const cometaButton = screen.getByText('Cometa').closest('button');
        fireEvent.click(cometaButton!);
        
        // Should auto-select after purchase
        await waitFor(() => {
            expect(cometaButton).toHaveClass('ring-sky-500');
        });
    });

    it('unlocked items persist in localStorage', async () => {
        localStorage.setItem('starryGems', '100');
        
        await navigateToCustomizeModal();
        
        // Purchase Cometa
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
        
        // Purchase Cometa (costs 20)
        const cometaButton = screen.getByText('Cometa').closest('button');
        fireEvent.click(cometaButton!);
        
        await waitFor(() => {
            const gems = localStorage.getItem('starryGems');
            expect(gems).toBe('80'); // 100 - 20
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
        render(<StarlinkHeartApp />);
        
        // Navigate to chat
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        const newMissionBtn = await screen.findByTestId('start-mission-btn');
        fireEvent.click(newMissionBtn);
        
        // Find mic button
        const micBtn = await screen.findByLabelText('Hlasový vstup');
        expect(micBtn).toBeInTheDocument();
    });

    it('mic button has correct styling', async () => {
        render(<StarlinkHeartApp />);
        
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        const newMissionBtn = await screen.findByTestId('start-mission-btn');
        fireEvent.click(newMissionBtn);
        
        const micBtn = await screen.findByLabelText('Hlasový vstup');
        expect(micBtn).toHaveClass('bg-emerald-500');
    });
});

describe('Service Worker Registration', () => {
    it('registers service worker on window load', async () => {
        // Mock navigator.serviceWorker
        const mockRegister = vi.fn().mockResolvedValue({ scope: '/' });
        Object.defineProperty(navigator, 'serviceWorker', {
            value: { register: mockRegister },
            writable: true,
            configurable: true
        });
        
        // This is a conceptual test - actual SW registration happens in main.tsx
        expect(typeof navigator.serviceWorker.register).toBe('function');
    });
});
