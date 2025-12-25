import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import '@testing-library/jest-dom';

const mockProps = {
  onBack: vi.fn(),
  onSettings: vi.fn(),
  onGemsTap: vi.fn(),
  avatar: 'iskra',
  gemCount: 100,
  isThinking: false,
  gemJustEarned: false,
  appBackground: { id: 'space', name: 'Space', className: 'bg-space', textColor: 'text-white', accent: 'bg-blue', glass: 'bg-glass' }
};

describe('Header Component', () => {
  it('renders correctly with title', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Starlink Heart')).toBeInTheDocument();
  });

  it('displays correct gem count', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<Header {...mockProps} />);
    const backButton = screen.getByRole('button', { name: /späť/i }); // Assuming aria-label or accessible name
    fireEvent.click(backButton);
    expect(mockProps.onBack).toHaveBeenCalled();
  });
  
  it('calls onSettings when settings button is clicked', () => {
    render(<Header {...mockProps} />);
    // Assuming settings button has proper aria-label, if not we might need to fix the Header component or use test-id
    // But for now let's try to query by icon content or class if needed, but best practice is role
    // Let's assume the button containing the SVG is accessible.
    const buttons = screen.getAllByRole('button');
    // The settings button is likely the last one
    fireEvent.click(buttons[buttons.length - 1]);
    expect(mockProps.onSettings).toHaveBeenCalled();
  });
});
