import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatMessage from '../components/chat/ChatMessage';
import { Heart } from '../types';

describe('ChatMessage Component', () => {
    const defaultHeart: Heart = {
        id: 'msg-1',
        message: 'Hello Starry!',
        timestamp: new Date('2024-01-01T10:00:00'),
        aiResponse: undefined
    };

    const defaultProps = {
        heart: defaultHeart,
        index: 0,
        totalHearts: 1,
        starryAvatar: '✨',
        appBackground: { id: 'space', glass: 'bg-slate-900/60' },
        hintLoadingId: null,
        parentGuideLoadingId: null,
        onGetHint: vi.fn(),
        onParentGuide: vi.fn(),
        allHearts: [defaultHeart],
        voiceMode: {
            isEnabled: false,
            isSupported: true,
            isSpeaking: false,
            speak: vi.fn(),
            stopSpeaking: vi.fn()
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('User Message Rendering', () => {
        it('renders user message text', () => {
            render(<ChatMessage {...defaultProps} />);
            expect(screen.getByText('Hello Starry!')).toBeInTheDocument();
        });

        it('renders message timestamp', () => {
            render(<ChatMessage {...defaultProps} />);
            expect(screen.getByText('10:00 AM')).toBeInTheDocument();
        });

        it('renders image when imageURL is provided', () => {
            const heartWithImage = {
                ...defaultHeart,
                imageURL: 'https://example.com/image.jpg'
            };
            render(<ChatMessage {...defaultProps} heart={heartWithImage} />);
            const img = screen.getByAltText('Úloha');
            expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
        });

        it('shows failed status with red background', () => {
            const failedHeart = { ...defaultHeart, status: 'failed' as const };
            render(<ChatMessage {...defaultProps} heart={failedHeart} />);
            const messageDiv = screen.getByText('Hello Starry!').closest('div');
            expect(messageDiv).toHaveClass('bg-red-500');
        });
    });

    describe('AI Response Rendering', () => {
        const heartWithAI: Heart = {
            ...defaultHeart,
            aiResponse: {
                textResponse: 'This is the AI response!',
                visualAids: []
            }
        };

        it('renders AI response when present', () => {
            render(<ChatMessage {...defaultProps} heart={heartWithAI} />);
            expect(screen.getByText('This is the AI response!')).toBeInTheDocument();
        });

        it('displays starry avatar next to AI response', () => {
            render(<ChatMessage {...defaultProps} heart={heartWithAI} />);
            expect(screen.getByText('✨')).toBeInTheDocument();
        });

        it('renders hint response with special styling', () => {
            const hintHeart: Heart = {
                ...heartWithAI,
                isHint: true
            };
            render(<ChatMessage {...defaultProps} heart={hintHeart} />);
            expect(screen.getByText('Super Nápoveda')).toBeInTheDocument();
            expect(screen.getByText('💡')).toBeInTheDocument();
        });

        it('renders visual aids when provided', () => {
            const heartWithVisuals: Heart = {
                ...defaultHeart,
                aiResponse: {
                    textResponse: 'Check this out!',
                    visualAids: ['🔢', '📊', '✅']
                }
            };
            render(<ChatMessage {...defaultProps} heart={heartWithVisuals} />);
            expect(screen.getByText('🔢')).toBeInTheDocument();
            expect(screen.getByText('📊')).toBeInTheDocument();
            expect(screen.getByText('✅')).toBeInTheDocument();
        });
    });

    describe('Action Buttons', () => {
        const heartWithAI: Heart = {
            ...defaultHeart,
            aiResponse: {
                textResponse: 'AI Response',
                visualAids: []
            },
            hintRequested: false,
            isHint: false
        };

        it('shows hint button when AI response exists and no hint requested', () => {
            render(<ChatMessage {...defaultProps} heart={heartWithAI} />);
            expect(screen.getByText(/Potrebujem nápovedu/i)).toBeInTheDocument();
        });

        it('calls onGetHint when hint button is clicked', () => {
            const onGetHint = vi.fn();
            render(<ChatMessage {...defaultProps} heart={heartWithAI} onGetHint={onGetHint} />);
            
            fireEvent.click(screen.getByText(/Potrebujem nápovedu/i));
            expect(onGetHint).toHaveBeenCalledWith('msg-1', expect.any(Array));
        });

        it('shows loading state for hint button', () => {
            render(<ChatMessage {...defaultProps} heart={heartWithAI} hintLoadingId="msg-1" />);
            expect(screen.getByText('Thinking...')).toBeInTheDocument();
        });

        it('shows parent guide button', () => {
            render(<ChatMessage {...defaultProps} heart={heartWithAI} />);
            expect(screen.getByText(/Rodičovský prekladač/i)).toBeInTheDocument();
        });

        it('calls onParentGuide when button is clicked', () => {
            const onParentGuide = vi.fn();
            render(<ChatMessage {...defaultProps} heart={heartWithAI} onParentGuide={onParentGuide} />);
            
            fireEvent.click(screen.getByText(/Rodičovský prekladač/i));
            expect(onParentGuide).toHaveBeenCalledWith('msg-1', expect.any(Array));
        });

        it('shows loading state for parent guide', () => {
            render(<ChatMessage {...defaultProps} heart={heartWithAI} parentGuideLoadingId="msg-1" />);
            expect(screen.getByText('Prekladám...')).toBeInTheDocument();
        });

        it('hides hint button when hint already requested', () => {
            const heartWithHintRequested = { ...heartWithAI, hintRequested: true };
            render(<ChatMessage {...defaultProps} heart={heartWithHintRequested} />);
            expect(screen.queryByText(/Potrebujem nápovedu/i)).not.toBeInTheDocument();
        });
    });

    describe('Text-to-Speech', () => {
        const heartWithAI: Heart = {
            ...defaultHeart,
            aiResponse: { textResponse: 'Speak this!', visualAids: [] }
        };

        it('shows TTS button when voice mode is enabled and supported', () => {
            const voiceMode = {
                isEnabled: true,
                isSupported: true,
                isSpeaking: false,
                speak: vi.fn(),
                stopSpeaking: vi.fn()
            };
            render(<ChatMessage {...defaultProps} heart={heartWithAI} voiceMode={voiceMode} />);
            expect(screen.getByTitle('Prečítať nahlas')).toBeInTheDocument();
        });

        it('calls speak when TTS button is clicked', () => {
            const speak = vi.fn();
            const voiceMode = {
                isEnabled: true,
                isSupported: true,
                isSpeaking: false,
                speak,
                stopSpeaking: vi.fn()
            };
            render(<ChatMessage {...defaultProps} heart={heartWithAI} voiceMode={voiceMode} />);
            
            fireEvent.click(screen.getByTitle('Prečítať nahlas'));
            expect(speak).toHaveBeenCalledWith('Speak this!');
        });

        it('shows stop icon when speaking', () => {
            const voiceMode = {
                isEnabled: true,
                isSupported: true,
                isSpeaking: true,
                speak: vi.fn(),
                stopSpeaking: vi.fn()
            };
            render(<ChatMessage {...defaultProps} heart={heartWithAI} voiceMode={voiceMode} />);
            expect(screen.getByText('⏹')).toBeInTheDocument();
        });

        it('hides TTS button when voice mode is disabled', () => {
            const voiceMode = {
                isEnabled: false,
                isSupported: true,
                isSpeaking: false,
                speak: vi.fn(),
                stopSpeaking: vi.fn()
            };
            render(<ChatMessage {...defaultProps} heart={heartWithAI} voiceMode={voiceMode} />);
            expect(screen.queryByTitle('Prečítať nahlas')).not.toBeInTheDocument();
        });
    });

    describe('FormatText Formatting', () => {
        it('renders bold text with ** syntax', () => {
            const heartWithBold: Heart = {
                ...defaultHeart,
                aiResponse: { textResponse: 'This is **bold** text', visualAids: [] }
            };
            render(<ChatMessage {...defaultProps} heart={heartWithBold} />);
            const boldElement = screen.getByText('bold');
            expect(boldElement.tagName).toBe('STRONG');
        });

        it('renders highlighted text with [[ ]] syntax', () => {
            const heartWithHighlight: Heart = {
                ...defaultHeart,
                aiResponse: { textResponse: 'Learn about [[photosynthesis]] today', visualAids: [] }
            };
            render(<ChatMessage {...defaultProps} heart={heartWithHighlight} />);
            const highlightedElement = screen.getByText('photosynthesis');
            expect(highlightedElement).toHaveClass('bg-yellow-100');
        });
    });
});
