import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const WelcomeScreen = lazy(() => import('./routes/WelcomeScreen'));
const Home = lazy(() => import('./routes/Home'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0b1226] text-sky-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      <span className="font-bold tracking-widest animate-pulse">NAČÍTAVAM...</span>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <WelcomeScreen />
      </Suspense>
    ),
  },
  {
    path: "/home",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Home />
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