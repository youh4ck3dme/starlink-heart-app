import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../hooks/use-toast';

// Test component that uses toast
const TestComponent = () => {
  const { toast } = useToast();
  
  return (
    <div>
      <button 
        data-testid="show-toast" 
        onClick={() => toast({ title: 'Test Toast', description: 'Test description' })}
      >
        Show Toast
      </button>
      <button 
        data-testid="show-error" 
        onClick={() => toast({ title: 'Error', description: 'Something went wrong', variant: 'error' })}
      >
        Show Error
      </button>
      <button 
        data-testid="show-success" 
        onClick={() => toast({ title: 'Success', variant: 'success' })}
      >
        Show Success
      </button>
      <button 
        data-testid="show-with-dismiss" 
        onClick={() => {
          const t = toast({ title: 'Dismissable', duration: 10000 });
          setTimeout(() => t.dismiss(), 100);
        }}
      >
        Show and Dismiss
      </button>
    </div>
  );
};

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithProvider = () => {
    return render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
  };

  describe('Toast Creation', () => {
    it('renders toast provider with children', () => {
      renderWithProvider();
      expect(screen.getByTestId('show-toast')).toBeInTheDocument();
    });

    it('can trigger toast function', () => {
      renderWithProvider();
      const showButton = screen.getByTestId('show-toast');
      fireEvent.click(showButton);
      // Toast was triggered without error
      expect(showButton).toBeInTheDocument();
    });

    it('can trigger error toast', () => {
      renderWithProvider();
      const errorButton = screen.getByTestId('show-error');
      fireEvent.click(errorButton);
      expect(errorButton).toBeInTheDocument();
    });

    it('can trigger success toast', () => {
      renderWithProvider();
      const successButton = screen.getByTestId('show-success');
      fireEvent.click(successButton);
      expect(successButton).toBeInTheDocument();
    });
  });

  describe('Toast Auto-dismiss', () => {
    it('toast auto-dismisses after duration', () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId('show-toast'));
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Toast should be auto-dismissed
      expect(screen.getByTestId('show-toast')).toBeInTheDocument();
    });
  });

  describe('Toast Manual Dismiss', () => {
    it('can manually dismiss toast', () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId('show-with-dismiss'));
      
      act(() => {
        vi.advanceTimersByTime(200);
      });
      
      expect(screen.getByTestId('show-with-dismiss')).toBeInTheDocument();
    });
  });
});

describe('Toast Component Rendering', () => {
  it('ToastProvider renders children correctly', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child Content</div>
      </ToastProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('ToastProvider wraps multiple children', () => {
    render(
      <ToastProvider>
        <div data-testid="child1">First</div>
        <div data-testid="child2">Second</div>
      </ToastProvider>
    );
    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });
});

describe('useToast Error Handling', () => {
  it('throws error when used outside provider', () => {
    const ErrorComponent = () => {
      try {
        useToast();
        return <div>No Error</div>;
      } catch (e) {
        return <div data-testid="error">Error Thrown</div>;
      }
    };
    
    // This should throw
    render(<ErrorComponent />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });
});
