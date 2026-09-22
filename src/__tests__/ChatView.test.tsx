import { render, screen } from '@testing-library/react';
import ChatView from '@/components/chat/ChatView';
import { Heart } from '@/types';

// Mock child components that might use complicated browser APIs or context
vi.mock('@/components/common/StarryAvatarDisplay', () => {
  const React = require('react');
  return {
    default: () => React.createElement('div', { 'data-testid': 'starry-avatar' }, 'Avatar')
  };
});

vi.mock('@/components/chat/ChatInput', () => {
  const React = require('react');
  return {
    default: () => React.createElement('div', { 'data-testid': 'chat-input' }, 'Input')
  };
});

vi.mock('@/components/chat/ChatMessage', () => {
  const React = require('react');
  return {
    default: ({ heart }: { heart: any }) => React.createElement('div', null, heart.message) // Fix: heart object contains message
  };
});

const mockProps = {
  hearts: [
    { id: '1', message: 'Hello Starry', timestamp: new Date(), aiResponse: { textResponse: 'Hi there', visualAids: [] } },
    { id: '2', message: 'Help me', timestamp: new Date() }
  ] as any[], // Use any[] or Heart[] if imported
  starryAvatar: 'iskra',
  appBackground: { id: 'space', glass: 'bg-glass' },
  isLoading: false,
  hasMore: false,
  isLoadingMore: false,
  isSending: false,
  hintLoadingId: null,
  parentGuideLoadingId: null,
  newMessage: '',
  setNewMessage: vi.fn(),
  imageFile: null,
  setImageFile: vi.fn(),
  imagePreviewUrl: null,
  isTeacherCloneMode: false,
  setIsTeacherCloneMode: vi.fn(),
  chatContainerRef: { current: null },
  messagesEndRef: { current: null },
  fileInputRef: { current: null },
  onLoadMore: vi.fn(),
  onSubmit: vi.fn(),
  onOpenCamera: vi.fn(),
  onGetHint: vi.fn(),
  onParentGuide: vi.fn(),
  voiceMode: { isListening: false } // Add missing voiceMode prop to suppress lint
};

describe('ChatView', () => {
  it('renders list of messages', () => {
    render(<ChatView {...mockProps} />);
    
    // Check for mocked messages
    expect(screen.getByText('Hello Starry')).toBeInTheDocument();
    expect(screen.getByText('Help me')).toBeInTheDocument();
  });

  it('renders loading state when isSending is true', () => {
    render(<ChatView {...mockProps} isSending={true} />);
    // The component shows StarryAvatarDisplay when sending.
    // Since we mock StarryAvatarDisplay with data-testid="starry-avatar", we can look for that.
    const avatars = screen.getAllByTestId('starry-avatar');
    expect(avatars.length).toBeGreaterThan(0);
  });
});
