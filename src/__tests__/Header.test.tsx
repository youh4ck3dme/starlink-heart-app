import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { GamificationProvider } from '@/features/gamification/context/GamificationContext';
import '@testing-library/jest-dom';

// Mock Zustand store
vi.mock('@/store/gameStore', () => ({
  useGameStore: (selector: (state: { gems: number }) => number) => {
    const mockState = { gems: 100 };
    return selector(mockState);
  }
}));

const mockProps = {
  onBack: vi.fn(),
  onSettings: vi.fn(),
  onGemsTap: vi.fn(),
  avatar: 'iskra',
  // gemCount removed - now from Zustand store
  isThinking: false,
  gemJustEarned: false,
  appBackground: { id: 'space', name: 'Space', className: 'bg-space', textColor: 'text-white', accent: 'bg-blue', glass: 'bg-glass' }
};

describe('Header Component', () => {
  it('renders correctly with title', () => {
    render(
      <GamificationProvider>
        <Header {...mockProps} />
      </GamificationProvider>
    );
    expect(screen.getByText('Starlink Heart')).toBeInTheDocument();
  });

  it('displays correct gem count', () => {
    render(
      <GamificationProvider>
        <Header {...mockProps} />
      </GamificationProvider>
    );
    // Gems now come from mocked Zustand store (100)
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <GamificationProvider>
        <Header {...mockProps} />
      </GamificationProvider>
    );
    const backButton = screen.getByRole('button', { name: /späť/i });
    fireEvent.click(backButton);
    expect(mockProps.onBack).toHaveBeenCalled();
  });
  
  it('calls onSettings when settings button is clicked', () => {
    render(
      <GamificationProvider>
        <Header {...mockProps} />
      </GamificationProvider>
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
    expect(mockProps.onSettings).toHaveBeenCalled();
  });
});
