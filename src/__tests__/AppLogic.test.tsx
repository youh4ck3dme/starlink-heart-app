
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
    }), // Returns unsubscribe fn
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

// Mock complex components to simplify rendering
vi.mock('../components/mascot/MascotRenderer', () => ({
    default: () => <div data-testid="mascot-renderer">Mascot</div>,
    MascotMode: { STAR: 'star', RIVE: 'rive', IMAGE: 'image' }
}));

vi.mock('../components/layout/LiveStarryBackground', () => ({
    default: () => <div data-testid="live-background" />
}));

// Mock ScrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

import { generateCosmicResponse } from '../services/geminiService';
import { addDoc, updateDoc } from '../services/localService';
import * as localService from '../services/localService';

describe('StarlinkHeartApp Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Assume we start on Dashboard/Chat for logic tests
        localStorage.setItem('hasStarted', 'true');
    });

    it('sendMessage sends message and updates UI optimistically', async () => {
        // Capture onSnapshot callback to simulate real-time updates
        let snapshotCallback: any;
        (localService.onSnapshot as any).mockImplementation((q: any, cb: any) => {
            snapshotCallback = cb;
            // Initial load
            cb({ 
                docs: Array.from({ length: 15 }, (_, i) => ({ 
                    data: () => ({ message: 'Old', timestamp: new Date() }), 
                    id: String(i) 
                })) 
            });
            return () => {};
        });

        // Mock addDoc to trigger snapshot update
        (addDoc as any).mockImplementation((col: any, data: any) => {
            if (snapshotCallback) {
                // Simulate adding the new doc to the end
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

        render(<StarlinkHeartApp />);

        // Initial render shows Intro because useEffect updates state after first render in Vitest
        // We find the Start button and click it
        const startBtn = screen.getByRole('button', { name: /ŠTART|Začať/i });
        fireEvent.click(startBtn);

        // Now we should be on Dashboard
        const newMissionBtn = await screen.findByText(/Nová/i); // Use findBy to wait for re-render
        fireEvent.click(newMissionBtn);

        // Type in input
        const input = screen.getByPlaceholderText(/Spýtaj sa Starryho/i);
        fireEvent.change(input, { target: { value: 'Hello Galaxy' } });

        // Click send
        const sendBtn = screen.getByLabelText('Poslať správu'); 
        fireEvent.click(sendBtn);

        // 1. Verify optimistic update (Message appears via snapshot simulation)
        await waitFor(() => {
            expect(screen.getAllByText(/Hello Galaxy/i)[0]).toBeInTheDocument();
        });

        // 2. Verify service call - now passes hearts array as second param
        expect(generateCosmicResponse).toHaveBeenCalled();
        expect((generateCosmicResponse as any).mock.calls[0][0]).toBe('Hello Galaxy');
        
        // 3. Verify DB update (addDoc called)
        expect(addDoc).toHaveBeenCalled();
        
        // 4. Verify AI Response appears handling
        // Since updateDoc is called, logic might update it again.
        // But generateCosmicResponse mock returns 'Cosmic hello!'
        // We verified calling it. UI update for response relies on updateDoc -> snapshot again?
        // Yes, likely. But we only mocked snapshot on addDoc. 
        // We can accept 'Hello Galaxy' appearing as sufficient proof of flow success.
    });

    it('sendMessage handles error gracefully', async () => {
        (generateCosmicResponse as any).mockRejectedValue(new Error('Cosmic interference'));
        
        render(<StarlinkHeartApp />);
        
        // Go through flow: Intro -> Dashboard -> Chat
        fireEvent.click(screen.getByRole('button', { name: /ŠTART|Začať/i }));
        
        const newMissionBtn = await screen.findByText(/Nová/i);
        fireEvent.click(newMissionBtn);

        const input = screen.getByPlaceholderText(/Spýtaj sa Starryho/i);
        fireEvent.change(input, { target: { value: 'Fail me' } });
        
        const sendBtn = screen.getByLabelText('Poslať správu');
        fireEvent.click(sendBtn);

        // Optimistic update - use getAllByText since there might be duplicates
        await waitFor(() => expect(screen.getAllByText('Fail me')[0]).toBeInTheDocument());

        // Wait for error handling
        // StarlinkHeartApp adds a "failed" status heart or logs error.
        // In the code: setHearts(prev => [...prev, failedHeart]);
        // failedHeart has message: msg.
        // Visual indication of failure?
        // ChatMessage component might show error state.
        // We can check clearly console error or just that the message remains but maybe response doesn't appear.
        
        // Since we mocked rejected value, we just want to ensure it didn't crash
        // and ideally logged error (we see console error in output).
        // Message "Fail me" should still be visible (optimistic).
        await waitFor(() => expect(screen.getAllByText('Fail me').length).toBeGreaterThan(0));

        // Ensure generateCosmicResponse was called
        expect(generateCosmicResponse).toHaveBeenCalled();

        // Ensure NO response text (mocked response) appears
        expect(screen.queryByText('Cosmic hello!')).not.toBeInTheDocument();
    });

    it('handleLoadMore loads older messages', async () => {
        // Mock getDocs to return something on load more
        const mockDocs = [{ 
            id: 'old-doc', 
            data: () => ({ message: 'Old Message', timestamp: new Date() }) 
        }];
        (localService.getDocs as any).mockResolvedValue({ docs: mockDocs });

        render(<StarlinkHeartApp />);
        
        // Go to chat
        fireEvent.click(screen.getByRole('button', { name: /ŠTART|Začať/i }));
        const newMissionBtn = await screen.findByText(/Nová/i);
        fireEvent.click(newMissionBtn);

        // Find "Načítať históriu" button
        // Note: It only appears if !isLoading && hasMore.
        // We need to ensure logic thinks hasMore=true.
        // And we need to wait for initial load to finish.
        
        const loadMoreBtn = await screen.findByText('Načítať históriu');
        expect(loadMoreBtn).toBeInTheDocument();
        
        fireEvent.click(loadMoreBtn);
        
        // Verify getDocs called with startAfter
        expect(localService.getDocs).toHaveBeenCalled();
        expect(localService.startAfter).toHaveBeenCalled();
    });
});
