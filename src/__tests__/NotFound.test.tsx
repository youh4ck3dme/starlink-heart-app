import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../routes/NotFound';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNotFound = () => {
    return render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('renders 404 text', () => {
      renderNotFound();
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('renders error message', () => {
      renderNotFound();
      expect(screen.getByText(/Stratili sme sa vo vesmíre/i)).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
      renderNotFound();
      expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
    });

    it('renders rocket emoji', () => {
      renderNotFound();
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('shows page not found message', () => {
      renderNotFound();
      expect(screen.getByText(/neexistuje/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has home button', () => {
      renderNotFound();
      expect(screen.getByText(/Späť domov/i)).toBeInTheDocument();
    });

    it('has back button', () => {
      renderNotFound();
      expect(screen.getByText(/← Späť/i)).toBeInTheDocument();
    });

    it('navigates home when home button clicked', () => {
      renderNotFound();
      const homeButton = screen.getByText(/Späť domov/i);
      fireEvent.click(homeButton);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates back when back button clicked', () => {
      renderNotFound();
      const backButton = screen.getByText(/← Späť/i);
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Styling', () => {
    it('has proper container structure', () => {
      const { container } = renderNotFound();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('shows footer error text', () => {
      renderNotFound();
      expect(screen.getByText(/Error 404/i)).toBeInTheDocument();
    });
  });
});
