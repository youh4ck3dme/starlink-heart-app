import React from 'react';
import { useNavigate } from 'react-router-dom';
import welcomeImage from '../assets/welcome.jpeg';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a0f1e] to-black text-white">
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
    </div>
  );
};

export default WelcomeScreen;
