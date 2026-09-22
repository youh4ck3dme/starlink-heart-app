import { render, screen, fireEvent } from '@testing-library/react';
import ProfileModal from '@/components/common/ProfileModal';
import { GamificationProvider } from '@/features/gamification/context/GamificationContext';

// Mock XP service to avoid localStorage dependency
vi.mock('@/services/xpService', () => ({
  getPlayerStats: () => ({
    xp: 120,
    level: 3,
    streak: 5,
    xpToNextLevel: 30,
    progress: 80,
    title: 'Galaktický Prieskumník'
  })
}));

describe('ProfileModal', () => {
  const mockOnClose = vi.fn();

  it('renders stats correctly', () => {
    render(
      <GamificationProvider>
        <ProfileModal onClose={mockOnClose} gems={50} hearts={10} />
      </GamificationProvider>
    );
    
    expect(screen.getByText(/Prieskumník vesmíru/i)).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // Gems
    expect(screen.getByText('10')).toBeInTheDocument(); // Hearts
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <GamificationProvider>
        <ProfileModal onClose={mockOnClose} />
      </GamificationProvider>
    );
    
    // There are multiple close buttons (X icon, backdrop, Close button), getting one by text is safest
    const closeBtn = screen.getByText('Zatvoriť');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
