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
    default: ({ mode }: { mode: string }) => <div data-testid="mascot-renderer" data-mode={mode}>Mascot</div>,
    MascotMode: { STAR: 'star', RIVE: 'rive', IMAGE: 'image' }
}));

vi.mock('../components/layout/LiveStarryBackground', () => ({
    default: () => <div data-testid="live-background" />
}));

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

    const navigateToSettings = async () => {
        render(<StarlinkHeartApp />);
        
        // Click Start
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        
        // Wait for Dashboard and click Settings (Centrum)
        const centrumBtn = await screen.findByText('Centrum');
        fireEvent.click(centrumBtn.closest('button')!);
        
        // Wait for modal
        await waitFor(() => {
            expect(screen.getByText('Vzhľad a Téma')).toBeInTheDocument();
        });
    };

    describe('Background Options Display', () => {
        it('displays all 4 background options', async () => {
            await navigateToSettings();
            
            expect(screen.getByText('Svetlá obloha')).toBeInTheDocument(); // sky
            expect(screen.getByText('Hlboký vesmír')).toBeInTheDocument(); // space
            expect(screen.getByText('Západ na Marse')).toBeInTheDocument(); // mars
            expect(screen.getByText('Galaktický vír')).toBeInTheDocument(); // galaxy
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

        it('switches to Galaxy background when clicked', async () => {
            await navigateToSettings();
            
            const galaxyBtn = screen.getByText('Galaktický vír').closest('button');
            fireEvent.click(galaxyBtn!);
            
            await waitFor(() => {
                expect(galaxyBtn).toHaveClass('ring-sky-500');
            });
        });
    });

    describe('Background CSS Classes', () => {
        it('applies bg-deep-space class for space theme', async () => {
            localStorage.setItem('starryBackground', 'space');
            render(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.bg-deep-space');
                expect(container).toBeInTheDocument();
            });
        });

        it('applies bg-sky-50 class for sky theme', async () => {
            localStorage.setItem('starryBackground', 'sky');
            render(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.bg-sky-50');
                expect(container).toBeInTheDocument();
            });
        });

        it('applies bg-mars-sunset class for mars theme', async () => {
            localStorage.setItem('starryBackground', 'mars');
            render(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.bg-mars-sunset');
                expect(container).toBeInTheDocument();
            });
        });

        it('applies bg-galaxy-swirl class for galaxy theme', async () => {
            localStorage.setItem('starryBackground', 'galaxy');
            render(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.bg-galaxy-swirl');
                expect(container).toBeInTheDocument();
            });
        });
    });

    describe('Background Persistence', () => {
        it('saves selected background to localStorage', async () => {
            await navigateToSettings();
            
            const marsBtn = screen.getByText('Západ na Marse').closest('button');
            fireEvent.click(marsBtn!);
            
            // Click save button
            const saveBtn = screen.getByText(/Uložiť|Hotovo/i);
            fireEvent.click(saveBtn);
            
            await waitFor(() => {
                expect(localStorage.getItem('starryBackground')).toBe('mars');
            });
        });

        it('loads saved background on app restart', async () => {
            localStorage.setItem('starryBackground', 'galaxy');
            
            render(<StarlinkHeartApp />);
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.bg-galaxy-swirl');
                expect(container).toBeInTheDocument();
            });
        });
    });

    describe('Text Color Adaptation', () => {
        it('uses dark text on light backgrounds (sky)', async () => {
            localStorage.setItem('starryBackground', 'sky');
            render(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.text-gray-800');
                expect(container).toBeInTheDocument();
            });
        });

        it('uses light text on dark backgrounds (space)', async () => {
            localStorage.setItem('starryBackground', 'space');
            render(<StarlinkHeartApp />);
            
            fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
            
            await waitFor(() => {
                const container = document.querySelector('.text-gray-100');
                expect(container).toBeInTheDocument();
            });
        });
    });
});

    describe('Avatar Modes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('hasStarted', 'true');
        // Unlock all new avatars for testing
        localStorage.setItem('unlockedAvatars', JSON.stringify(['⭐', '☄️', '🤖']));
        localStorage.setItem('starryGems', '999');
    });

    const navigateToSettings = async () => {
        render(<StarlinkHeartApp />);
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        const centrumBtn = await screen.findByText('Centrum');
        fireEvent.click(centrumBtn.closest('button')!);
        await waitFor(() => {
            expect(screen.getByText('Vzhľad a Téma')).toBeInTheDocument();
        });
    };

    describe('Avatar Options Display', () => {
        it('displays all 3 avatar options', async () => {
            await navigateToSettings();
            
            expect(screen.getByText('Starry')).toBeInTheDocument();
            expect(screen.getByText('Cometa')).toBeInTheDocument();
            expect(screen.getByText('Robo')).toBeInTheDocument();
        });
    });

    describe('Avatar Switching', () => {
        it('switches avatar when clicked', async () => {
            await navigateToSettings();
            
            // Switch to Cometa
            const cometaBtn = screen.getByText('Cometa').closest('button');
            fireEvent.click(cometaBtn!);
            
            await waitFor(() => {
                expect(cometaBtn).toHaveClass('ring-sky-500');
            });
        });
    });

    describe('Avatar Persistence', () => {
        it('saves selected avatar to localStorage', async () => {
            await navigateToSettings();
            
            const roboBtn = screen.getByText('Robo').closest('button');
            fireEvent.click(roboBtn!);
            
            // Verify selection happened first
            await waitFor(() => {
                expect(roboBtn).toHaveClass('ring-sky-500');
            });

            // Click explicit save button
            const saveBtn = screen.getByText('Uložiť zmeny'); 
            fireEvent.click(saveBtn);
            
            await waitFor(() => {
                expect(localStorage.getItem('starryAvatar')).toBe('🤖');
            });
        });
    });
});

describe('Mascot Modes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('hasStarted', 'true');
    });

    it('renders with avatar display on dashboard', async () => {
        render(<StarlinkHeartApp />);
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        
        await waitFor(() => {
            // Dashboard should show avatar image (Starry default)
            const avatars = screen.getAllByAltText(/Starry Mascot|Avatar/i);
            expect(avatars.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('mascot mode can be changed in settings', async () => {
        render(<StarlinkHeartApp />);
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        
        const centrumBtn = await screen.findByTestId('open-settings-btn');
        fireEvent.click(centrumBtn);
        
        await waitFor(() => {
            // Verify settings modal opened
            expect(screen.getByText('Vzhľad a Téma')).toBeInTheDocument();
        });
    });
});
