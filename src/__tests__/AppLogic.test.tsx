import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StarlinkHeartApp from '../components/StarlinkHeartApp';
import { generateCosmicResponse } from '../services/geminiService';
import { addDoc } from '../services/localService';
import * as localService from '../services/localService';

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
        // execute callback immediately to simulate load
        // Return 15 docs to set hasMore = true
        onNext({ 
            docs: Array.from({ length: 15 }, (_, i) => ({ 
                data: () => ({}), 
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
    hasParentConsent: vi.fn(() => true), // Default to consented
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

// Mock complex components
vi.mock('../components/mascot/MascotRenderer', () => ({
    default: () => <div data-testid="mascot-renderer">Mascot</div>,
    MascotMode: { STAR: 'star', RIVE: 'rive', IMAGE: 'image' }
}));

vi.mock('../components/layout/LiveStarryBackground', () => ({
    default: () => <div data-testid="live-background" />
}));

// Mock DashboardScreen to ensure buttons exist for navigation
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

    it('sendMessage sends message and updates UI optimistically', async () => {
        let snapshotCallback: any;
        (localService.onSnapshot as any).mockImplementation((q: any, cb: any) => {
            snapshotCallback = cb;
            cb({ 
                docs: Array.from({ length: 15 }, (_, i) => ({ 
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
                        ...Array.from({ length: 15 }, (_, i) => ({ 
                            data: () => ({ message: 'Old', timestamp: new Date() }), 
                            id: String(i) 
                        })),
                        { data: () => data, id: 'new-doc' }
                    ]
                });
            }
            return Promise.resolve({ id: 'new-doc' });
        });

        render(
            <MemoryRouter>
                <StarlinkHeartApp />
            </MemoryRouter>
        );

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
        expect((generateCosmicResponse as any).mock.calls[0][0]).toBe('Hello Galaxy');
        expect(addDoc).toHaveBeenCalled();
    });

    it('sendMessage handles error gracefully', async () => {
        (generateCosmicResponse as any).mockRejectedValue(new Error('Cosmic interference'));
        
        render(
            <MemoryRouter>
                <StarlinkHeartApp />
            </MemoryRouter>
        );
        
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        
        const newMissionBtn = await screen.findByTestId('start-mission-btn');
        fireEvent.click(newMissionBtn);

        const input = await screen.findByPlaceholderText(/Spýtaj sa Starryho/i);
        fireEvent.change(input, { target: { value: 'Fail me' } });
        
        const sendBtn = screen.getByLabelText('Poslať správu');
        fireEvent.click(sendBtn);

        await waitFor(() => expect(screen.getAllByText('Fail me')[0]).toBeInTheDocument());

        await waitFor(() => expect(screen.getAllByText('Fail me').length).toBeGreaterThan(0));

        expect(generateCosmicResponse).toHaveBeenCalled();
        expect(screen.queryByText('Cosmic hello!')).not.toBeInTheDocument();
    });

    it('handleLoadMore loads older messages', async () => {
        const mockDocs = [{ 
            id: 'old-doc', 
            data: () => ({ message: 'Old Message', timestamp: new Date() }) 
        }];
        (localService.getDocs as any).mockResolvedValue({ docs: mockDocs });

        render(
            <MemoryRouter>
                <StarlinkHeartApp />
            </MemoryRouter>
        );
        
        fireEvent.click(screen.getByRole('button', { name: /Start App|ŠTART|Začať/i }));
        const newMissionBtn = await screen.findByTestId('start-mission-btn');
        fireEvent.click(newMissionBtn);
        
        const loadMoreBtn = await screen.findByText('Načítať históriu');
        expect(loadMoreBtn).toBeInTheDocument();
        
        fireEvent.click(loadMoreBtn);
        
        expect(localService.getDocs).toHaveBeenCalled();
        expect(localService.startAfter).toHaveBeenCalled();
    });
});
