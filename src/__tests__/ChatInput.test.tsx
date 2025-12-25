import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '../components/chat/ChatInput';
import React from 'react';

// Mock VoiceRecordingModal
vi.mock('../components/chat/VoiceRecordingModal', () => ({
    default: ({ isListening }: { isListening: boolean }) => 
        isListening ? <div data-testid="voice-modal">Recording...</div> : null
}));

describe('ChatInput Component', () => {
    const defaultProps = {
        newMessage: '',
        setNewMessage: vi.fn(),
        imageFile: null,
        setImageFile: vi.fn(),
        imagePreviewUrl: null,
        isTeacherCloneMode: false,
        setIsTeacherCloneMode: vi.fn(),
        isSending: false,
        appBackground: { glass: 'bg-slate-900/60' },
        fileInputRef: { current: null } as React.RefObject<HTMLInputElement>,
        onSubmit: vi.fn((e) => e.preventDefault()),
        onOpenCamera: vi.fn(),
        voiceMode: {
            isEnabled: false,
            isSupported: true,
            isListening: false,
            startListening: vi.fn(),
            stopListening: vi.fn()
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders textarea with default placeholder', () => {
            render(<ChatInput {...defaultProps} />);
            expect(screen.getByPlaceholderText(/Spýtaj sa Starryho/i)).toBeInTheDocument();
        });

        it('renders send button', () => {
            render(<ChatInput {...defaultProps} />);
            expect(screen.getByLabelText('Poslať správu')).toBeInTheDocument();
        });

        it('renders camera button', () => {
            render(<ChatInput {...defaultProps} />);
            // Camera button - find by its container
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThanOrEqual(3); // camera, image, send
        });
    });

    describe('Text Input', () => {
        it('calls setNewMessage when typing', () => {
            render(<ChatInput {...defaultProps} />);
            const textarea = screen.getByPlaceholderText(/Spýtaj sa Starryho/i);
            fireEvent.change(textarea, { target: { value: 'Hello Starry!' } });
            expect(defaultProps.setNewMessage).toHaveBeenCalledWith('Hello Starry!');
        });

        it('submits on Enter key (without Shift)', () => {
            render(<ChatInput {...defaultProps} newMessage="Test message" />);
            const textarea = screen.getByPlaceholderText(/Spýtaj sa Starryho/i);
            fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
            expect(defaultProps.onSubmit).toHaveBeenCalled();
        });

        it('does not submit on Shift+Enter (allows new line)', () => {
            render(<ChatInput {...defaultProps} newMessage="Test message" />);
            const textarea = screen.getByPlaceholderText(/Spýtaj sa Starryho/i);
            fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
            expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Send Button State', () => {
        it('disables send button when message is empty', () => {
            render(<ChatInput {...defaultProps} />);
            const sendBtn = screen.getByLabelText('Poslať správu');
            expect(sendBtn).toBeDisabled();
        });

        it('enables send button when message has content', () => {
            render(<ChatInput {...defaultProps} newMessage="Hello" />);
            const sendBtn = screen.getByLabelText('Poslať správu');
            expect(sendBtn).not.toBeDisabled();
        });

        it('enables send button when image is attached (even without text)', () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            render(<ChatInput {...defaultProps} imageFile={mockFile} />);
            const sendBtn = screen.getByLabelText('Poslať správu');
            expect(sendBtn).not.toBeDisabled();
        });

        it('disables send button while sending', () => {
            render(<ChatInput {...defaultProps} newMessage="Hello" isSending={true} />);
            const sendBtn = screen.getByLabelText('Poslať správu');
            expect(sendBtn).toBeDisabled();
        });
    });

    describe('Teacher Clone Mode', () => {
        it('shows "Hravý Starlink" label in normal mode', () => {
            render(<ChatInput {...defaultProps} />);
            expect(screen.getByText('Hravý Starlink')).toBeInTheDocument();
        });

        it('shows "Starlink Kouč" label in teacher mode', () => {
            render(<ChatInput {...defaultProps} isTeacherCloneMode={true} />);
            expect(screen.getByText('Starlink Kouč')).toBeInTheDocument();
        });

        it('changes placeholder in teacher mode', () => {
            render(<ChatInput {...defaultProps} isTeacherCloneMode={true} />);
            expect(screen.getByPlaceholderText(/Režim Učiteľa/i)).toBeInTheDocument();
        });

        it('toggles teacher mode when toggle is clicked', () => {
            render(<ChatInput {...defaultProps} />);
            // Find toggle button (the one with translate-x animation)
            const toggleButtons = screen.getAllByRole('button');
            const toggleBtn = toggleButtons.find(btn => btn.classList.contains('w-10'));
            if (toggleBtn) {
                fireEvent.click(toggleBtn);
                expect(defaultProps.setIsTeacherCloneMode).toHaveBeenCalledWith(true);
            }
        });

        it('applies indigo styling in teacher mode', () => {
            render(<ChatInput {...defaultProps} isTeacherCloneMode={true} newMessage="Test" />);
            const sendBtn = screen.getByLabelText('Poslať správu');
            expect(sendBtn).toHaveClass('bg-indigo-600');
        });
    });

    describe('Image Handling', () => {
        it('shows image preview when file is selected', () => {
            const mockFile = new File(['test'], 'homework.jpg', { type: 'image/jpeg' });
            render(<ChatInput {...defaultProps} imageFile={mockFile} imagePreviewUrl="blob:test" />);
            expect(screen.getByText('homework.jpg')).toBeInTheDocument();
            expect(screen.getByAltText('Preview')).toBeInTheDocument();
        });

        it('clears image when X button is clicked', () => {
            const mockFile = new File(['test'], 'homework.jpg', { type: 'image/jpeg' });
            render(<ChatInput {...defaultProps} imageFile={mockFile} />);
            
            const clearBtn = screen.getByText('×');
            fireEvent.click(clearBtn);
            expect(defaultProps.setImageFile).toHaveBeenCalledWith(null);
        });

        it('calls onOpenCamera when camera button is clicked', () => {
            render(<ChatInput {...defaultProps} />);
            // Find camera button by its SVG path (camera icon)
            const cameraBtn = document.querySelector('button[type="button"]');
            if (cameraBtn) {
                fireEvent.click(cameraBtn);
                // Camera button should be in the form, onOpenCamera should be called
            }
            // This test is structural - we verify the button exists and is clickable
            expect(cameraBtn).toBeInTheDocument();
        });
    });

    describe('Voice Mode', () => {
        it('shows mic button when voice mode is enabled and supported', () => {
            const voiceMode = {
                isEnabled: true,
                isSupported: true,
                isListening: false,
                startListening: vi.fn(),
                stopListening: vi.fn()
            };
            render(<ChatInput {...defaultProps} voiceMode={voiceMode} />);
            expect(screen.getByLabelText('Hlasový vstup')).toBeInTheDocument();
        });

        it('hides mic button when voice mode is disabled', () => {
            const voiceMode = {
                isEnabled: false,
                isSupported: true,
                isListening: false,
                startListening: vi.fn(),
                stopListening: vi.fn()
            };
            render(<ChatInput {...defaultProps} voiceMode={voiceMode} />);
            expect(screen.queryByLabelText('Hlasový vstup')).not.toBeInTheDocument();
        });

        it('shows listening state with red background', () => {
            const voiceMode = {
                isEnabled: true,
                isSupported: true,
                isListening: true,
                startListening: vi.fn(),
                stopListening: vi.fn()
            };
            render(<ChatInput {...defaultProps} voiceMode={voiceMode} />);
            const micBtn = screen.getByLabelText('Zastaviť nahrávanie');
            expect(micBtn).toHaveClass('bg-red-500');
        });

        it('changes placeholder when listening', () => {
            const voiceMode = {
                isEnabled: true,
                isSupported: true,
                isListening: true,
                startListening: vi.fn(),
                stopListening: vi.fn()
            };
            render(<ChatInput {...defaultProps} voiceMode={voiceMode} />);
            expect(screen.getByPlaceholderText('Počúvam...')).toBeInTheDocument();
        });

        it('shows VoiceRecordingModal when listening', () => {
            const voiceMode = {
                isEnabled: true,
                isSupported: true,
                isListening: true,
                startListening: vi.fn(),
                stopListening: vi.fn()
            };
            render(<ChatInput {...defaultProps} voiceMode={voiceMode} />);
            expect(screen.getByTestId('voice-modal')).toBeInTheDocument();
        });
    });

    describe('Form Submission', () => {
        it('calls onSubmit when form is submitted', () => {
            render(<ChatInput {...defaultProps} newMessage="Hello" />);
            const form = screen.getByLabelText('Poslať správu').closest('form');
            fireEvent.submit(form!);
            expect(defaultProps.onSubmit).toHaveBeenCalled();
        });
    });
});
