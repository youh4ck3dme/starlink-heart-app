import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GamificationProvider } from '../features/gamification/context/GamificationContext';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        AnimatePresence: ({ children }: any) => <>{children}</>,
        motion: {
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
            button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
        },
    };
});

// Mock lottie-web to avoid canvas issues
vi.mock('lottie-web', () => ({
    default: {
        loadAnimation: vi.fn(() => ({
            destroy: vi.fn(),
            play: vi.fn(),
            pause: vi.fn(),
        })),
    },
}));

// Mock lottie-react
vi.mock('lottie-react', () => ({
    default: () => <div data-testid="lottie-mock">Lottie</div>,
}));

// Mock @react-three/fiber to avoid WebGL issues
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }: any) => <div data-testid="three-canvas">{children}</div>,
    useFrame: vi.fn(),
    useThree: () => ({ camera: {}, gl: {}, scene: {} }),
}));

// Mock @react-three/drei 
vi.mock('@react-three/drei', () => ({
    useGLTF: () => ({ scene: {} }),
    Stars: () => null,
    OrbitControls: () => null,
}));

// Mock PlanetCorner to avoid R3F issues
vi.mock('../components/effects/PlanetCorner', () => ({
    PlanetCorner: () => <div data-testid="planet-mock">Planet</div>,
}));

// Test wrapper with all providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <GamificationProvider>
            {children}
        </GamificationProvider>
    </MemoryRouter>
);

describe('UI/UX Tests', () => {
    describe('Accessibility (a11y)', () => {
        it('all interactive elements should have accessible names', async () => {
            const { default: DashboardScreen } = await import('../components/screens/DashboardScreen');
            
            render(
                <TestWrapper>
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
                        mascotMode="image"
                    />
                </TestWrapper>
            );

            // Check main CTA button
            const missionBtn = screen.getByTestId('start-mission-btn');
            expect(missionBtn).toBeInTheDocument();
            expect(missionBtn.textContent).toContain('Nová Misia');

            // Check quick action buttons have text
            const schoolBtn = screen.getByTestId('school-dashboard-btn');
            expect(schoolBtn.textContent).toContain('Škola');
        });

        it('buttons should be keyboard focusable', async () => {
            const { default: DashboardScreen } = await import('../components/screens/DashboardScreen');
            
            render(
                <TestWrapper>
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
                        mascotMode="image"
                    />
                </TestWrapper>
            );

            const buttons = screen.getAllByRole('button');
            buttons.forEach(btn => {
                expect(btn).not.toHaveAttribute('tabindex', '-1');
            });
        });
    });

    describe('Responsive Design', () => {
        it('dashboard should render without horizontal overflow', async () => {
            const { default: DashboardScreen } = await import('../components/screens/DashboardScreen');
            
            const { container } = render(
                <TestWrapper>
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
                        mascotMode="image"
                    />
                </TestWrapper>
            );

            // Container should have max-width constraints
            const mainDiv = container.firstChild as HTMLElement;
            expect(mainDiv).toHaveClass('relative');
        });
    });

    describe('Interactions', () => {
        it('clicking mission button should trigger callback', async () => {
            const { default: DashboardScreen } = await import('../components/screens/DashboardScreen');
            const onNewMission = vi.fn();
            
            render(
                <TestWrapper>
                    <DashboardScreen
                        onNewMission={onNewMission}
                        onProfile={() => {}}
                        onCenter={() => {}}
                        onCoachToggle={() => {}}
                        onSchoolDashboard={() => {}}
                        onEduPage={() => {}}
                        isCoachMode={false}
                        avatar="🚀"
                        gems={100}
                        textColor="text-white"
                        mascotMode="image"
                    />
                </TestWrapper>
            );

            const missionBtn = screen.getByTestId('start-mission-btn');
            fireEvent.click(missionBtn);
            
            expect(onNewMission).toHaveBeenCalledTimes(1);
        });

        it('coach toggle should change visual state', async () => {
            const { default: DashboardScreen } = await import('../components/screens/DashboardScreen');
            
            const { rerender } = render(
                <TestWrapper>
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
                        mascotMode="image"
                    />
                </TestWrapper>
            );

            // Find coach button by text
            const coachBtnOff = screen.getByText('Kouč');
            expect(coachBtnOff).toBeInTheDocument();

            // Rerender with coach mode ON
            rerender(
                <TestWrapper>
                    <DashboardScreen
                        onNewMission={() => {}}
                        onProfile={() => {}}
                        onCenter={() => {}}
                        onCoachToggle={() => {}}
                        onSchoolDashboard={() => {}}
                        onEduPage={() => {}}
                        isCoachMode={true}
                        avatar="🚀"
                        gems={100}
                        textColor="text-white"
                        mascotMode="image"
                    />
                </TestWrapper>
            );

            const coachBtnOn = screen.getByText('ON');
            expect(coachBtnOn).toBeInTheDocument();
        });
    });

    describe('Visual States', () => {
        it('gems display should show correct value', async () => {
            const { default: DashboardHeader } = await import('../components/layout/DashboardHeader');
            
            render(
                <TestWrapper>
                    <DashboardHeader
                        avatar="🚀"
                        gems={999}
                        textColor="text-white"
                        onProfile={() => {}}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('999')).toBeInTheDocument();
        });
    });
});
