import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-[#060819] via-[#0a0f2e] to-[#060819] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
        
        {/* Animated 404 Text */}
        <div className="relative">
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500" />
        </div>

        {/* Cute Spaceship/Rocket */}
        <div className="text-8xl animate-float">
          🚀
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-sky-100">
            Stratili sme sa vo vesmíre...
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Táto stránka neexistuje alebo bola premiestená do inej galaxie.
          </p>
        </div>

        {/* Stars decoration */}
        <div className="flex justify-center gap-2 text-yellow-400 text-sm">
          <span className="animate-twinkle">✦</span>
          <span className="animate-twinkle" style={{ animationDelay: '0.5s' }}>✦</span>
          <span className="animate-twinkle" style={{ animationDelay: '1s' }}>✦</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 
                     text-white font-bold text-lg rounded-2xl
                     shadow-lg shadow-blue-500/30
                     hover:scale-105 hover:-translate-y-1
                     active:scale-95
                     transition-all duration-300"
          >
            🏠 Späť domov
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm
                     text-white font-semibold text-lg rounded-2xl
                     border-2 border-white/20
                     hover:bg-white/20
                     active:scale-95
                     transition-all duration-300"
          >
            ← Späť
          </button>
        </div>

        {/* Footer text */}
        <p className="text-xs text-white/20 mt-8">
          Error 404 • Stránka nenájdená
        </p>
      </div>
    </div>
  );
}
