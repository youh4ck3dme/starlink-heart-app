import { Link } from 'react-router-dom';
import welcomeImg from '../assets/welcome.jpeg';

export default function WelcomeScreen() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center text-white">
      {/* Vignette effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial_gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-12 p-4 text-center animate-fade-in-up">
        
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          Starlink Heart
        </h1>

        {/* Hero Image Container */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 animate-float">
          <img 
            src={welcomeImg} 
            alt="Starlink Heart" 
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          />
        </div>

        {/* CTA Button */}
        <Link 
          to="/home"
          className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.8)] active:scale-95 hover:scale-105"
        >
          <span className="text-lg">Začať misiu 🚀</span>
          {/* Optional glow effect on button hover/active if needed, keyframes already handle shadow */}
        </Link>
      </div>
    </div>
  );
}
