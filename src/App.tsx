import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const WelcomeScreen = lazy(() => import('./routes/WelcomeScreen'));
const Home = lazy(() => import('./routes/Home'));
const AuthPage = lazy(() => import('./routes/AuthPage'));

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
 * Route guard: Redirect to /home if user has already started
 */
const WelcomeRoute = () => {
  if (hasStarted()) {
    return <Navigate to="/home" replace />;
  }
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
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;