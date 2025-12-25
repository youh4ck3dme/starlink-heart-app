import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import welcomeImage from '../assets/welcome.jpeg';
import { BACKGROUND_OPTIONS, DEFAULT_BACKGROUND, STARRY_BACKGROUND_KEY } from '../constants/theme';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const isLightBackground = background.id === 'sky';

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
    <div
      className={`relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden ${background.className} ${background.textColor}`}
      data-testid="welcome-screen"
    >
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>

      {/* Hero Image */}
      <div className="relative z-10 w-full max-w-md px-6 mb-8 animate-fade-in-up">
         {/* Option A: Import Usage */}
        <img 
          src={welcomeImage} 
          alt="Starlink Heart Hero" 
          className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
        />
      </div>

      {/* Title */}
      <h1 className="relative z-10 text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 mb-12 drop-shadow-lg tracking-tight text-center">
        Starlink Heart
      </h1>

      {/* CTA Button */}
      <button 
        onClick={() => navigate('/home')}
        className="relative z-10 group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all transform hover:scale-105 active:scale-95 text-xl flex items-center gap-3"
      >
        <span>Začať misiu</span>
        <span className="text-2xl group-hover:translate-x-1 transition-transform">🚀</span>
      </button>

      <div
        className={`relative z-10 mt-10 flex flex-col items-center gap-3 text-sm ${
          isLightBackground ? 'text-gray-600' : 'text-white/80'
        }`}
      >
        <span
          className={`uppercase tracking-[0.2em] text-xs ${
            isLightBackground ? 'text-gray-500' : 'text-white/60'
          }`}
        >
          Pozadie
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {BACKGROUND_OPTIONS.map((bg) => {
            const isActive = bg.id === background.id;
            return (
              <button
                key={bg.id}
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
  );
};

export default WelcomeScreen;
