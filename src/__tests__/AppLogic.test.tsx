import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StarlinkHeartApp from '../components/StarlinkHeartApp';
import { generateCosmicResponse } from '../services/geminiService';
import { addDoc } from '../services/localService';
import * as localService from '../services/localService';
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
    onSnapshot: vi.fn((q, onNext) => {
        onNext({ 
            docs: Array.from({ length: 15 }, (_, i) => ({ 
                data: () => ({ message: 'Old', timestamp: new Date() }), 
                id: String(i) 
            })) 
        });
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
        toggleListening: vi.fn(),
        transcript: '',
        resetTranscript: vi.fn(),
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
            React.createElement('button', { 'data-testid': 'start-mission-btn', onClick: props.onNewMission }, 'Nová Misia')
        )
    };
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('StarlinkHeartApp Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('hasStarted', 'true');
    });

    const renderApp = () => {
        return render(
            <GamificationProvider>
                <MemoryRouter>
                    <StarlinkHeartApp />
                </MemoryRouter>
            </GamificationProvider>
        );
    };

    it('sendMessage sends message and updates UI optimistically', async () => {
        let snapshotCallback: any;
        (localService.onSnapshot as any).mockImplementation((q: any, cb: any) => {
            snapshotCallback = cb;
            cb({ 
                docs: Array.from({ length: 5 }, (_, i) => ({ 
                    data: () => ({ message: 'Old', timestamp: new Date() }), 
                    id: String(i) 
                })) 
            });
            return () => {};
        });

        (addDoc as any).mockImplementation((col: any, data: any) => {
            if (snapshotCallback) {
                snapshotCallback({ 
                    docs: [
                        ...Array.from({ length: 5 }, (_, i) => ({ 
                            data: () => ({ message: 'Old', timestamp: new Date() }), 
                            id: String(i) 
                        })),
                        { data: () => data, id: 'new-doc' }
                    ]
                });
            }
            return Promise.resolve({ id: 'new-doc' });
        });

        renderApp();

        // Already bypassed welcome screen because of hasStarted = true
        const startBtn = screen.getByRole('button', { name: /Start App|ŠTART|Začať/i });
        fireEvent.click(startBtn);

        const newMissionBtn = await screen.findByTestId('start-mission-btn');
        fireEvent.click(newMissionBtn);

        const input = await screen.findByPlaceholderText(/Spýtaj sa Starryho/i);
        fireEvent.change(input, { target: { value: 'Hello Galaxy' } });

        const sendBtn = screen.getByLabelText('Poslať správu'); 
        fireEvent.click(sendBtn);

        await waitFor(() => {
            expect(screen.getAllByText(/Hello Galaxy/i)[0]).toBeInTheDocument();
        });

        expect(generateCosmicResponse).toHaveBeenCalled();
        expect(addDoc).toHaveBeenCalled();
    });

    it('sendMessage handles error gracefully', async () => {
        (generateCosmicResponse as any).mockRejectedValue(new Error('Cosmic interference'));
        
        renderApp();
        
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        
        const newMissionBtn = await screen.findByTestId('start-mission-btn');
        fireEvent.click(newMissionBtn);

        const input = await screen.findByPlaceholderText(/Spýtaj sa Starryho/i);
        fireEvent.change(input, { target: { value: 'Fail me' } });
        
        const sendBtn = screen.getByLabelText('Poslať správu');
        fireEvent.click(sendBtn);

        await waitFor(() => expect(screen.getAllByText('Fail me')[0]).toBeInTheDocument());
        expect(generateCosmicResponse).toHaveBeenCalled();
    });
});
