import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicBackground from '../components/background/CosmicBackground';
import GalaxyRoadmap from '../components/roadmap/GalaxyRoadmap';
import {
  BACKGROUND_OPTIONS,
  DEFAULT_BACKGROUND,
  STARRY_BACKGROUND_KEY,
} from '../constants/theme';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);

  useEffect(() => {
    const savedBackgroundId = localStorage.getItem(STARRY_BACKGROUND_KEY);
    const savedBackground = BACKGROUND_OPTIONS.find((bg) => bg.id === savedBackgroundId);
    if (savedBackground) {
      setBackground(savedBackground);
    }
  }, []);

  const handleBackgroundChange = (id: string) => {
    const selected = BACKGROUND_OPTIONS.find((bg) => bg.id === id);
    if (!selected) return;
    setBackground(selected);
    localStorage.setItem(STARRY_BACKGROUND_KEY, selected.id);
  };

  return (
    <CosmicBackground variant="default" intensity={0.9} className="min-h-screen">
      <div
        className={`min-h-screen flex flex-col ${background.className}`}
        data-testid="welcome-screen"
        data-background={background.id}
      >
        <header className="pt-6 px-6 flex items-center justify-between text-white/90">
          <h1 className="text-xl font-bold drop-shadow">Starlink Heart</h1>
          <nav aria-label="Hlavná navigácia" className="flex items-center gap-3">
            <button
              className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm"
              aria-label="Zobraziť diamanty"
            >
              120 💎
            </button>
            <button
              className="p-2 rounded-full bg-white/10 backdrop-blur"
              aria-label="Nastavenia"
              onClick={() => navigate('/home')}
            >
              ⚙️
            </button>
          </nav>
        </header>

        <main className="mt-4 flex-1">
          <GalaxyRoadmap
            onEnter={() => {
              localStorage.setItem('hasStarted', 'true');
              // Ensure navigation happens in the next tick to prevent event bubbling issues
              setTimeout(() => navigate('/home'), 100);
            }}
          />
        </main>

        <div className="relative z-10 mb-8 flex flex-col items-center gap-3 text-sm text-white/80 px-4">
          <span className="uppercase tracking-[0.2em] text-xs text-white/60" id="welcome-bg-label">
            Pozadie
          </span>
          <div
            className="flex flex-wrap justify-center gap-2"
            role="radiogroup"
            aria-labelledby="welcome-bg-label"
          >
            {BACKGROUND_OPTIONS.map((bg) => {
              const isActive = bg.id === background.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-pressed={isActive}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => handleBackgroundChange(bg.id)}
                  className={`px-3 py-1.5 rounded-full border transition-all text-xs font-semibold ${
                    isActive
                      ? 'border-white bg-white/20 text-white'
                      : 'border-white/20 bg-black/20 hover:bg-white/10'
                  }`}
                  data-testid={`background-option-${bg.id}`}
                >
                  {bg.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
}
