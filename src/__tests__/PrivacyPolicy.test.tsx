import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPolicy from '../routes/PrivacyPolicy';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPrivacyPolicy = () => {
    return render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );
  };

  describe('Header', () => {
    it('renders the page title', () => {
      renderPrivacyPolicy();
      expect(screen.getByText('Zásady ochrany súkromia')).toBeInTheDocument();
    });

    it('has a back button', () => {
      renderPrivacyPolicy();
      expect(screen.getByLabelText('Späť')).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', () => {
      renderPrivacyPolicy();
      screen.getByLabelText('Späť').click();
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Content Sections', () => {
    it('shows last updated date', () => {
      renderPrivacyPolicy();
      expect(screen.getByText(/Posledná aktualizácia/)).toBeInTheDocument();
    });

    it('renders the intro section', () => {
      renderPrivacyPolicy();
      expect(screen.getByText('Vaše súkromie je pre nás dôležité')).toBeInTheDocument();
    });

    it('renders data collection section', () => {
      renderPrivacyPolicy();
      expect(screen.getByText('Aké údaje zhromažďujeme')).toBeInTheDocument();
    });

    it('renders data security section', () => {
      renderPrivacyPolicy();
      expect(screen.getByText('Ako chránime vaše údaje')).toBeInTheDocument();
    });

    it('renders COPPA section', () => {
      renderPrivacyPolicy();
      expect(screen.getByText(/Ochrana detí/)).toBeInTheDocument();
    });

    it('mentions local storage', () => {
      renderPrivacyPolicy();
      expect(screen.getByText(/Lokálne uložené dáta/i)).toBeInTheDocument();
    });

    it('mentions AI conversations', () => {
      renderPrivacyPolicy();
      expect(screen.getByText(/AI konverzácie/i)).toBeInTheDocument();
    });

    it('mentions no personal data collection', () => {
      renderPrivacyPolicy();
      expect(screen.getByText(/Žiadne osobné údaje/i)).toBeInTheDocument();
    });
  });

  describe('Contact Section', () => {
    it('renders contact section', () => {
      renderPrivacyPolicy();
      expect(screen.getByText('Kontakt')).toBeInTheDocument();
    });

    it('has email link', () => {
      renderPrivacyPolicy();
      expect(screen.getByText('privacy@starlinkheart.com')).toBeInTheDocument();
    });

    it('email link has correct href', () => {
      renderPrivacyPolicy();
      const emailLink = screen.getByText('privacy@starlinkheart.com');
      expect(emailLink).toHaveAttribute('href', 'mailto:privacy@starlinkheart.com');
    });
  });

  describe('Footer', () => {
    it('renders copyright notice', () => {
      renderPrivacyPolicy();
      expect(screen.getByText(/© 2024 Starlink Heart/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading structure', () => {
      renderPrivacyPolicy();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0);
    });

    it('back button is keyboard accessible', () => {
      renderPrivacyPolicy();
      const backButton = screen.getByLabelText('Späť');
      expect(backButton).toHaveAttribute('aria-label');
    });
  });
});
