import React from 'react';
import StarryAvatarDisplay from '../common/StarryAvatarDisplay';
import { useGamification } from '../../features/gamification/context/GamificationContext';
import { useGameStore } from '../../store/gameStore';

interface HeaderProps {
  onBack: () => void;
  onSettings: () => void;
  onGemsTap: () => void;
  avatar: string;
  // gemCount removed - now from Zustand store
  isThinking?: boolean;
  gemJustEarned?: boolean;
  appBackground: { id: string; glass: string };
}

export default function Header({
  onBack,
  onSettings,
  onGemsTap,
  avatar,
  // gemCount removed - using Zustand
  isThinking = false,
  gemJustEarned = false,
  appBackground,
}: HeaderProps) {
  // ✅ Zustand: Get gems from store (auto-persisted!)
  const gems = useGameStore((state) => state.gems);
  const isDarkTheme = appBackground.id !== 'sky';
  const { state } = useGamification();

  return (
    <header 
      className={`shrink-0 px-4 py-3 flex items-center justify-between sticky top-0 z-20 ${appBackground.glass} backdrop-blur-md shadow-sm border-b border-white/10`}
    >
      {/* LEFT SECTION: Back + Avatar + Gems */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onBack} 
          className="mr-1 p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Späť"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <StarryAvatarDisplay 
          avatar={avatar} 
          isThinking={isThinking} 
          isExcited={gemJustEarned}
          size="text-2xl"
          gender={state.gender}
        />

        {/* Gems Badge - Next to avatar */}
        <button
          onClick={onGemsTap}
          aria-label={`Počet drahokamov: ${gems}`}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border-2 transition-all ${
            gemJustEarned 
              ? 'bg-yellow-400 border-yellow-500 scale-110 animate-pulse' 
              : 'bg-yellow-400/30 border-yellow-500/50 hover:bg-yellow-400/50'
          }`}
        >
          <span className="text-lg">{gemJustEarned ? '✨' : '💎'}</span>
          <span className={`font-bold ${isDarkTheme ? 'text-yellow-200' : 'text-yellow-800'}`}>
            {gems}
          </span>
        </button>
      </div>

      {/* CENTER SECTION: Title */}
      <div className="flex flex-col items-center">
        <h1 
          className={`text-xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-sky-600'}`}
        >
          Starlink Heart
        </h1>
        <span className={`text-xs font-medium opacity-80 ${isDarkTheme ? 'text-white' : 'text-sky-800'}`}>
          Ahoj, {state.userName}!
        </span>
      </div>

      {/* RIGHT SECTION: Settings only */}
      <div className="flex items-center">
        {/* Settings Button */}
        <button 
          onClick={onSettings} 
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Nastavenia"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
