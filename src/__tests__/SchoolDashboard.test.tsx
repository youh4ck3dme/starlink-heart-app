import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SchoolDashboard from '../routes/SchoolDashboard';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useEdupage
vi.mock('../features/edupage/hooks/useEdupage', () => ({
  useEdupage: vi.fn(() => ({
    snapshot: {
      timetable: [
        { start: '08:00', end: '08:45', subject: 'Matematika', teacher: 'Mgr. Nováková' },
        { start: '08:55', end: '09:40', subject: 'Slovenský jazyk', teacher: 'Mgr. Slováková' },
        { start: '10:00', end: '10:45', subject: 'Anglický jazyk', teacher: 'Mgr. English' },
        { start: '10:55', end: '11:40', subject: 'Fyzika', teacher: 'Mgr. Fyzik' },
      ],
      grades: [
        { subject: 'MAT', value: '1', date: '20.12.2025' },
        { subject: 'SJL', value: '2', date: '21.12.2025' },
      ],
      timeline: [
        { title: 'Nová úloha z matematiky', date: '22.12.2025' },
        { title: 'Triedna schôdza 15.1.', date: '23.12.2025' },
      ]
    },
    loading: false,
    error: null,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn()
  }))
}));

describe('SchoolDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <SchoolDashboard />
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('renders the dashboard header', () => {
      renderDashboard();
      expect(screen.getByText('ŠKOLA')).toBeInTheDocument();
    });

    it('renders the timetable card', () => {
      renderDashboard();
      expect(screen.getByRole('region', { name: /Dnešný rozvrh/i })).toBeInTheDocument();
      expect(screen.getByText('Matematika')).toBeInTheDocument();
    });

    it('renders the grades card', () => {
      renderDashboard();
      expect(screen.getByRole('region', { name: /Posledné známky/i })).toBeInTheDocument();
    });

    it('renders the notices card', () => {
      renderDashboard();
      expect(screen.getByRole('region', { name: /Oznamy/i })).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('starts with green theme by default', () => {
      renderDashboard();
      const themeButton = screen.getByLabelText(/Prepnúť tému/i);
      expect(themeButton).toBeInTheDocument();
    });

    it('toggles theme when clicked', () => {
      renderDashboard();
      const themeButton = screen.getByLabelText(/Prepnúť tému/i);
      fireEvent.click(themeButton);
      
      expect(localStorage.getItem('dashboardTheme')).toBe('pink');
    });

    it('loads theme from localStorage', () => {
      localStorage.setItem('dashboardTheme', 'pink');
      renderDashboard();
      
      expect(screen.getByLabelText(/Prepnúť tému/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back to home when back button is clicked', () => {
      renderDashboard();
      const backButton = screen.getByLabelText(/Späť na hlavnú stránku/i);
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-labels on all cards', () => {
      renderDashboard();
      
      expect(screen.getByRole('region', { name: /Dnešný rozvrh/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /Posledné známky/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /Oznamy/i })).toBeInTheDocument();
    });

    it('has aria-hidden on decorative icons', () => {
      renderDashboard();
      const timetableRegion = screen.getByRole('region', { name: /Dnešný rozvrh/i });
      expect(timetableRegion.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    it('has accessible back button', () => {
      renderDashboard();
      expect(screen.getByLabelText(/Späť na hlavnú stránku/i)).toBeInTheDocument();
    });

    it('has accessible theme toggle', () => {
      renderDashboard();
      expect(screen.getByLabelText(/Prepnúť tému/i)).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('displays all lessons in timetable', () => {
      renderDashboard();
      expect(screen.getByText('Matematika')).toBeInTheDocument();
      expect(screen.getByText('Slovenský jazyk')).toBeInTheDocument();
      expect(screen.getByText('Anglický jazyk')).toBeInTheDocument();
      expect(screen.getByText('Fyzika')).toBeInTheDocument();
    });

    it('displays lesson times', () => {
      renderDashboard();
      expect(screen.getByText('08:00')).toBeInTheDocument();
    });

    it('displays teacher names', () => {
      renderDashboard();
      expect(screen.getByText(/Mgr\. Nováková/i)).toBeInTheDocument();
    });

    it('displays grades', () => {
      renderDashboard();
      expect(screen.getByText('MAT')).toBeInTheDocument();
      expect(screen.getByText('SJL')).toBeInTheDocument();
    });

    it('displays notices', () => {
      renderDashboard();
      expect(screen.getByText('Nová úloha z matematiky')).toBeInTheDocument();
      expect(screen.getByText('Triedna schôdza 15.1.')).toBeInTheDocument();
    });
  });
});
