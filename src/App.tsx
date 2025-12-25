import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import WelcomeScreen from './routes/WelcomeScreen';
import Home from './routes/Home';

// Skip welcome screen if user has already started
const hasStarted = () => localStorage.getItem('hasStarted') === '1';

const router = createBrowserRouter([
  {
    path: "/",
    element: hasStarted() ? <Navigate to="/home" replace /> : <WelcomeScreen />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;