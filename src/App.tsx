import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WelcomeScreen from './routes/WelcomeScreen';
import Home from './routes/Home';

const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomeScreen />,
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