import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ToastProvider } from './hooks/use-toast';

const WelcomeScreen = lazy(() => import('./routes/WelcomeScreen'));
const Home = lazy(() => import('./routes/Home'));
const AuthPage = lazy(() => import('./routes/AuthPage'));
const SchoolDashboard = lazy(() => import('./routes/SchoolDashboard'));
const SchoolPage = lazy(() => import('./routes/SchoolPage'));
const PrivacyPolicy = lazy(() => import('./routes/PrivacyPolicy'));
const NotFound = lazy(() => import('./routes/NotFound'));

/**
 * Check if user has started the app (clicked "Začať misiu")
 */
function hasStarted(): boolean {
  return localStorage.getItem('hasStarted') === 'true';
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-dvh bg-[#060819] text-sky-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      <span className="font-bold tracking-widest animate-pulse">NAČÍTAVAM...</span>
    </div>
  </div>
);

/**
 * Welcome page - always accessible
 */
const WelcomeRoute = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WelcomeScreen />
    </Suspense>
  );
};

/**
 * Route guard: Redirect to / if user hasn't started yet
 */
const HomeRoute = () => {
  if (!hasStarted()) {
    return <Navigate to="/" replace />;
  }
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Home />
    </Suspense>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomeRoute />,
  },
  {
    path: "/home",
    element: <HomeRoute />,
  },
  {
    path: "/auth",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthPage />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SchoolDashboard />
      </Suspense>
    ),
  },
  {
    path: "/school",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SchoolPage />
      </Suspense>
    ),
  },
  {
    path: "/privacy",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PrivacyPolicy />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

import { GamificationProvider, useGamification } from './features/gamification/context/GamificationContext';
import { useDailyStreakTick } from './features/gamification/hooks/useStreak';

function AppContent() {
  const { state } = useGamification();
  useDailyStreakTick(true); // Active streak tracking
  
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <GamificationProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </GamificationProvider>
  );
}

export default App;