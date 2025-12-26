import React from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicBackground from '../components/background/CosmicBackground';
import GalaxyRoadmap from '../components/roadmap/GalaxyRoadmap';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <CosmicBackground variant="default" intensity={0.9} className="min-h-screen">
      <header className="pt-6 px-6 flex items-center justify-between text-white/90">
        <div className="text-xl font-bold drop-shadow">Starlink Heart</div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm">120 💎</button>
          <button 
            className="p-2 rounded-full bg-white/10 backdrop-blur" 
            aria-label="Nastavenia"
            onClick={() => navigate('/home')} // Temporary link to home for settings
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="mt-4">
        <GalaxyRoadmap onEnter={(id) => {
            console.log('Navigating to home with planet:', id);
            localStorage.setItem('hasStarted', 'true');
            // Ensure navigation happens in the next tick to prevent event bubbling issues
            setTimeout(() => navigate('/home'), 100);
        }} />
      </main>
    </CosmicBackground>
  );
}

