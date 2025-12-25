import { render, screen, fireEvent } from '@testing-library/react';
import ParentNotice from '@/components/ParentNotice';

describe('ParentNotice', () => {
  it('renders notice content', () => {
    render(<ParentNotice onAccept={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/informácia pre rodiča/i)).toBeInTheDocument();
  });

  it('calls onAccept when confirm button is clicked', () => {
    const handleAccept = vi.fn();
    render(<ParentNotice onAccept={handleAccept} onCancel={vi.fn()} />);
    const confirmBtn = screen.getByText(/súhlasím/i);
    fireEvent.click(confirmBtn);
    expect(handleAccept).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(<ParentNotice onAccept={vi.fn()} onCancel={handleCancel} />);
    const cancelBtn = screen.getByText('Zrušiť');
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalled();
  });
});
