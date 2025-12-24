import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarlinkHeartApp from '../components/StarlinkHeartApp'; // Integrating the existing app

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen flex flex-col">
      {/* Back Button Overlay */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => navigate('/')}
          className="bg-black/20 hover:bg-black/40 text-white/50 hover:text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all text-sm font-medium border border-white/10"
        >
          ← Späť na hlavnú
        </button>
      </div>

      {/* We render the actual app here so functionality isn't lost, 
          but technically this serves as the "Home" page requested. */}
      <StarlinkHeartApp />
    </div>
  );
};

export default Home;
