import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CameraModal from '../components/camera/CameraModal';

// Mock MediaDevices API
const mockGetUserMedia = vi.fn();
const mockStop = vi.fn();

beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock MediaStream and tracks
    const mockTrack = { stop: mockStop, kind: 'video' };
    const mockStream = {
        getTracks: () => [mockTrack],
        getVideoTracks: () => [mockTrack]
    };
    
    mockGetUserMedia.mockResolvedValue(mockStream);
    
    // Mock navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
        value: {
            getUserMedia: mockGetUserMedia
        },
        writable: true,
        configurable: true
    });
    
    // Mock HTMLMediaElement.play()
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    
    // Mock alert
    window.alert = vi.fn();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('CameraModal Component', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onPhotoTaken: vi.fn()
    };

    describe('Rendering', () => {
        it('renders nothing when isOpen is false', () => {
            render(<CameraModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByText('Zrušiť')).not.toBeInTheDocument();
        });

        it('renders modal when isOpen is true', () => {
            render(<CameraModal {...defaultProps} />);
            expect(screen.getByText('Zrušiť')).toBeInTheDocument();
        });

        it('renders video element', () => {
            render(<CameraModal {...defaultProps} />);
            const video = document.querySelector('video');
            expect(video).toBeInTheDocument();
        });

        it('renders shutter button', () => {
            render(<CameraModal {...defaultProps} />);
            const buttons = screen.getAllByRole('button');
            // Shutter button is the largest one (w-20 h-20)
            const shutterBtn = buttons.find(btn => btn.classList.contains('w-20'));
            expect(shutterBtn).toBeInTheDocument();
        });

        it('renders text mode toggle button', () => {
            render(<CameraModal {...defaultProps} />);
            const textModeBtn = screen.getByTitle('Vysoký kontrast pre text');
            expect(textModeBtn).toBeInTheDocument();
        });

        it('renders camera switch button', () => {
            render(<CameraModal {...defaultProps} />);
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThanOrEqual(4); // text mode, shutter, switch, cancel
        });
    });

    describe('Camera Access', () => {
        it('requests camera access on open', async () => {
            render(<CameraModal {...defaultProps} />);
            
            await waitFor(() => {
                expect(mockGetUserMedia).toHaveBeenCalledWith({
                    video: { facingMode: 'environment' }
                });
            });
        });

        it('uses environment camera by default (back camera)', async () => {
            render(<CameraModal {...defaultProps} />);
            
            await waitFor(() => {
                expect(mockGetUserMedia).toHaveBeenCalledWith(
                    expect.objectContaining({
                        video: { facingMode: 'environment' }
                    })
                );
            });
        });

        it('stops camera tracks when modal closes', async () => {
            const { rerender } = render(<CameraModal {...defaultProps} />);
            
            await waitFor(() => {
                expect(mockGetUserMedia).toHaveBeenCalled();
            });
            
            // Close modal
            rerender(<CameraModal {...defaultProps} isOpen={false} />);
            
            expect(mockStop).toHaveBeenCalled();
        });
    });

    describe('Camera Error Handling', () => {
        it('shows alert when camera access is denied', async () => {
            mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
            
            render(<CameraModal {...defaultProps} />);
            
            await waitFor(() => {
                expect(window.alert).toHaveBeenCalledWith(
                    'Potrebný prístup ku kamere. Skontrolujte nastavenia.'
                );
            });
        });

        it('calls onClose when camera access fails', async () => {
            mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
            const onClose = vi.fn();
            
            render(<CameraModal {...defaultProps} onClose={onClose} />);
            
            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });
    });

    describe('Text Mode', () => {
        it('toggles text mode when button is clicked', () => {
            render(<CameraModal {...defaultProps} />);
            
            const textModeBtn = screen.getByTitle('Vysoký kontrast pre text');
            fireEvent.click(textModeBtn);
            
            // Should show "Textový Režim" indicator
            expect(screen.getByText('Textový Režim')).toBeInTheDocument();
        });

        it('applies grayscale filter in text mode', () => {
            render(<CameraModal {...defaultProps} />);
            
            const textModeBtn = screen.getByTitle('Vysoký kontrast pre text');
            fireEvent.click(textModeBtn);
            
            const video = document.querySelector('video');
            expect(video?.style.filter).toContain('grayscale');
        });

        it('changes button style when text mode is active', () => {
            render(<CameraModal {...defaultProps} />);
            
            const textModeBtn = screen.getByTitle('Vysoký kontrast pre text');
            expect(textModeBtn).toHaveClass('bg-white/10');
            
            fireEvent.click(textModeBtn);
            expect(textModeBtn).toHaveClass('bg-white');
        });
    });

    describe('Camera Switch', () => {
        it('switches between front and back camera', async () => {
            render(<CameraModal {...defaultProps} />);
            
            await waitFor(() => {
                expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
            });
            
            // Find switch button (last button before cancel)
            const buttons = screen.getAllByRole('button');
            const switchBtn = buttons[2]; // Text, Shutter, Switch, Cancel
            
            fireEvent.click(switchBtn);
            
            await waitFor(() => {
                expect(mockGetUserMedia).toHaveBeenCalledWith({
                    video: { facingMode: 'user' }
                });
            });
        });
    });

    describe('Photo Capture', () => {
        it('calls onPhotoTaken when shutter is clicked', async () => {
            // Mock canvas context
            const mockToBlob = vi.fn((callback) => {
                callback(new Blob(['test'], { type: 'image/jpeg' }));
            });
            
            const mockGetContext = vi.fn(() => ({
                drawImage: vi.fn(),
                filter: ''
            }));
            
            HTMLCanvasElement.prototype.getContext = mockGetContext as any;
            HTMLCanvasElement.prototype.toBlob = mockToBlob;
            
            render(<CameraModal {...defaultProps} />);
            
            // Find and click shutter button
            const buttons = screen.getAllByRole('button');
            const shutterBtn = buttons.find(btn => btn.classList.contains('w-20'));
            
            fireEvent.click(shutterBtn!);
            
            await waitFor(() => {
                expect(defaultProps.onPhotoTaken).toHaveBeenCalled();
            });
        });
    });

    describe('Close Button', () => {
        it('calls onClose when cancel button is clicked', () => {
            render(<CameraModal {...defaultProps} />);
            
            const cancelBtn = screen.getByText('Zrušiť');
            fireEvent.click(cancelBtn);
            
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    describe('Grid Overlay', () => {
        it('renders camera grid overlay', () => {
            render(<CameraModal {...defaultProps} />);
            
            // Grid has specific class for pointer-events-none
            const overlay = document.querySelector('.pointer-events-none.opacity-30');
            expect(overlay).toBeInTheDocument();
        });
    });
});
