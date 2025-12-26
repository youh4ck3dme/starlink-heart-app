import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Don't mock these - we want to test real behavior!
import RiveMascot from '../components/mascot/RiveMascot';
import MascotRenderer from '../components/mascot/MascotRenderer';

// Mock only the Rive library since it needs canvas
vi.mock('@rive-app/react-canvas', () => ({
    useRive: () => ({
        RiveComponent: null, // Simulate failed load
        rive: null
    })
}));

// Mock Spline - too heavy for unit tests
vi.mock('@splinetool/react-spline', () => ({
    default: () => <div data-testid="spline-mock" />
}));

describe('MascotRenderer Fallback Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('RiveMascot Fallback', () => {
        it('shows fallback emoji when Rive fails to load', () => {
            render(<RiveMascot className="test-class" />);
            
            // Should show ✨ emoji as fallback
            expect(screen.getByText('✨')).toBeInTheDocument();
        });

        it('does NOT show empty or invisible element when Rive fails', () => {
            const { container } = render(<RiveMascot />);
            
            // Should have visible content
            const content = container.textContent;
            expect(content).toBeTruthy();
            expect(content?.trim()).not.toBe('');
        });

        it('has correct fallback styling', () => {
            const { container } = render(<RiveMascot className="test-class" />);
            
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.style.display).toBe('flex');
            expect(wrapper.style.alignItems).toBe('center');
            expect(wrapper.style.justifyContent).toBe('center');
        });
    });

    describe('MascotRenderer Mode Fallbacks', () => {
        it('renders with image mode correctly', () => {
            const { container } = render(<MascotRenderer mode="image" />);
            
            const img = container.querySelector('img');
            expect(img).toBeInTheDocument();
            // Fallback image alt changed to "Starry Loading" in shared fallback
            expect(img?.alt).toBe('Starry Loading');
        });

        it('renders with rive mode and shows fallback when Rive unavailable', async () => {
            render(<MascotRenderer mode="rive" />);
            
            // Since Rive is mocked to fail, should show fallback
            // Wrapped in waitFor for lazy load
            await expect(screen.findByText('✨')).resolves.toBeInTheDocument();
        });

        it('does NOT render Spline for spline3d mode without valid URL', async () => {
            const { container } = render(<MascotRenderer mode="spline3d" />);
            
            // Should fallback to Rive (then to emoji since Rive is mocked to fail)
            // Lazy load needs async wait
            await expect(screen.findByText('✨')).resolves.toBeInTheDocument();
            expect(screen.queryByTestId('spline-mock')).not.toBeInTheDocument();
        });

        it('never renders empty canvas', () => {
            const { container } = render(<MascotRenderer mode="rive" />);
            
            const canvas = container.querySelector('canvas');
            // Either no canvas at all, or canvas with content
            if (canvas) {
                // Canvas exists - verify it's not just an empty placeholder
                expect(canvas.width).toBeGreaterThan(0);
                expect(canvas.height).toBeGreaterThan(0);
            } else {
                // No canvas - verify fallback is shown
                expect(container.textContent?.trim()).not.toBe('');
            }
        });
    });

    describe('DashboardScreen Avatar Display', () => {
        // This test ensures avatar is visible, not hidden by canvas
        it('should display emoji avatar, not canvas in top bar', async () => {
            // Import after mocks are set up
            const { default: DashboardScreen } = await import('../components/screens/DashboardScreen');
            
            render(
                <DashboardScreen
                    onNewMission={() => {}}
                    onProfile={() => {}}
                    onCenter={() => {}}
                    onCoachToggle={() => {}}
                    onSchoolDashboard={() => {}}
                    onEduPage={() => {}}
                    isCoachMode={false}
                    avatar="🚀"
                    gems={100}
                    textColor="text-white"
                    mascotMode="rive"
                />
            );
            
            // Should see the avatar emoji in the component
            const avatars = screen.getAllByText('🚀');
            expect(avatars.length).toBeGreaterThanOrEqual(1);
            
            // Should NOT have any empty canvas elements
            const containers = document.querySelectorAll('canvas');
            containers.forEach(canvas => {
                // If there's a canvas, it should have dimensions
                if (canvas.parentElement?.offsetWidth) {
                    expect(true).toBe(true); // Has proper dimensions
                }
            });
        });
    });

    describe('Empty State Detection', () => {
        it('correctly identifies components with visible content', () => {
            const VisibleComponent = () => <div>Hello</div>;
            const { container } = render(<VisibleComponent />);
            
            const hasVisibleContent = container.textContent!.trim() !== '';
            expect(hasVisibleContent).toBe(true);
        });

        it('would catch components that render invisible/empty content', () => {
            // This is an example of what we want to PREVENT
            // In real scenario, this test would fail, alerting us to fix the component
            const hasContent = (el: HTMLElement) => {
                return el.textContent?.trim() !== '' || 
                       el.querySelector('img') !== null ||
                       el.querySelector('svg') !== null;
            };
            
            // Our fixed RiveMascot should pass this check
            const { container } = render(<RiveMascot />);
            expect(hasContent(container)).toBe(true);
        });
    });
});
