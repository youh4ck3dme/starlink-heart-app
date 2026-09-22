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
    default: ({ mode }: { mode: string }) => <div data-testid="mascot-renderer" data-mode={mode}>Mascot</div>,
    MascotMode: { STAR: 'star', RIVE: 'rive', IMAGE: 'image' }
}));

vi.mock('../components/layout/LiveStarryBackground', () => ({
    default: () => <div data-testid="live-background" />
}));

// Mock Complex Screens to avoid Canvas/3D issues in JSDOM
vi.mock('../components/screens/DashboardScreen', () => {
    const React = require('react');
    return { default: (props: any) => React.createElement('div', { 'data-testid': 'dashboard-screen' }, 
        React.createElement('button', { 'data-testid': 'start-mission-btn', onClick: props.onNewMission }, 'Nová Misia'), 
        React.createElement('button', { 'data-testid': 'profile-btn', onClick: props.onProfile }, 'Profile'), 
        React.createElement('button', { 'data-testid': 'open-settings-btn', onClick: props.onCenter }, 'Centrum'), 
        React.createElement('button', { onClick: props.onCoachToggle }, props.isCoachMode ? 'Kouč: ON' : 'Kouč: OFF'),
        React.createElement('img', { alt: 'Starry Mascot', src: props.avatar === '⭐' ? 'starry.png' : 'other.png' })
    ) };
});

vi.mock('../components/screens/SchoolDashboard', () => {
    const React = require('react');
    return { default: () => React.createElement('div', { 'data-testid': 'school-dashboard' }, 'School Dashboard') };
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Background Modes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('hasStarted', 'true');
        // Unlock all backgrounds for testing
        localStorage.setItem('unlockedBackgrounds', JSON.stringify(['sky', 'space', 'mars', 'galaxy']));
        localStorage.setItem('starryGems', '999');
    });

    const renderWithContext = (ui: React.ReactElement, initialState?: any) => {
        return render(
            <GamificationProvider initialState={initialState}>
                <MemoryRouter>
                    {ui}
                </MemoryRouter>
            </GamificationProvider>
        );
    };

    const navigateToSettings = async (initialState?: any) => {
        renderWithContext(<StarlinkHeartApp />, initialState);
        
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

    describe('Background Options Display', () => {
        it('displays all 4 background options', async () => {
            await navigateToSettings();
            
            expect(screen.getByText('Svetlá obloha')).toBeInTheDocument(); 
            expect(screen.getByText('Hlboký vesmír')).toBeInTheDocument(); 
            expect(screen.getByText('Západ na Marse')).toBeInTheDocument(); 
            expect(screen.getByText('Galaktický vír')).toBeInTheDocument();
        });

        it('shows checkmark on selected background', async () => {
            await navigateToSettings();
            
            // Default is "Hlboký vesmír" (space)
            const spaceBtn = screen.getByText('Hlboký vesmír').closest('button');
            expect(spaceBtn).toHaveClass('ring-sky-500');
        });
    });

    describe('Background Switching', () => {
        it('switches to Sky background when clicked', async () => {
            await navigateToSettings();
            
            const skyBtn = screen.getByText('Svetlá obloha').closest('button');
            fireEvent.click(skyBtn!);
            
            await waitFor(() => {
                expect(skyBtn).toHaveClass('ring-sky-500');
            });
        });

        it('switches to Mars background when clicked', async () => {
            await navigateToSettings();
            
            const marsBtn = screen.getByText('Západ na Marse').closest('button');
            fireEvent.click(marsBtn!);
            
            await waitFor(() => {
                expect(marsBtn).toHaveClass('ring-sky-500');
            });
        });
    });

    describe('Background CSS Classes', () => {
        it('applies bg-deep-space class for space theme', async () => {
            localStorage.setItem('starryBackground', 'space');
            renderWithContext(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.bg-deep-space');
                expect(container).toBeInTheDocument();
            });
        });

        it('applies bg-sky-50 class for sky theme', async () => {
            localStorage.setItem('starryBackground', 'sky');
            renderWithContext(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.bg-sky-50');
                expect(container).toBeInTheDocument();
            });
        });
    });

    describe('Background Persistence', () => {
        it('saves selected background to localStorage', async () => {
            await navigateToSettings();
            
            const marsBtn = screen.getByText('Západ na Marse').closest('button');
            fireEvent.click(marsBtn!);
            
            // Click save button (X button or custom save if implemented, here it's close button)
            const saveBtn = screen.getByTestId('close-settings-btn'); 
            fireEvent.click(saveBtn);
            
            await waitFor(() => {
                expect(localStorage.getItem('starryBackground')).toBe('mars');
            });
        });
    });

    describe('Text Color Adaptation', () => {
        it('uses dark text on light backgrounds (sky)', async () => {
            localStorage.setItem('starryBackground', 'sky');
            renderWithContext(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.text-gray-800');
                expect(container).toBeInTheDocument();
            });
        });
    });

    describe('Avatar Display (Level-Based)', () => {
        it('displays correct avatar title for the level', async () => {
            await navigateToSettings({ level: 6 }); // Level 6 = Cometa
            expect(screen.getByText('Cometa')).toBeInTheDocument();
        });

        it('renders with avatar display on dashboard', async () => {
            renderWithContext(<StarlinkHeartApp />, { level: 11 }); // Level 11 = Starry
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const avatars = screen.getAllByAltText(/Starry Mascot|Avatar/i);
                expect(avatars.length).toBeGreaterThanOrEqual(1);
            });
        });
    });
});
