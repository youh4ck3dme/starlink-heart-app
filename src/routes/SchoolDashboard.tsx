import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Calendar, Award, Bell, LogIn, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { useEdupage } from '../features/edupage/hooks/useEdupage';
import { TimetableLesson, Grade, TimelineItem } from '../core/types/schoolSystem';

// Backgrounds
import greenBg from '../assets/dashboard-bg.webp';
import pinkBg from '../assets/dashboard-bg-pink.webp';

// --- Components ---

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center mb-6">
      <div className="text-4xl font-black tracking-widest drop-shadow-lg font-mono">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-sm font-medium opacity-80 uppercase tracking-wide">
        {time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  );
};

// Educational Particles Component
const EducationalParticles = ({ theme }: { theme: 'green' | 'pink' }) => {
  const particles = useMemo(() => {
    const items = ['2+2=?', 'A', 'B', 'C', '100', '📚', '✏️', 'E=mc²', '∑', 'π', '?', '!'];
    return items.map((text, i) => ({
      id: i,
      text,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 8,
      size: 12 + Math.random() * 16,
      opacity: 0.15 + Math.random() * 0.25,
    }));
  }, []);

  const color = theme === 'green' ? 'text-emerald-400' : 'text-pink-400';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute ${color} font-bold animate-float-up`}
          style={{
            left: `${p.left}%`,
            bottom: '-50px',
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
};

// Timetable Card
const TimetableCard = ({ theme, lessons }: { theme: 'green' | 'pink', lessons: TimetableLesson[] }) => {
  const accent = theme === 'green' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-pink-500/50 bg-pink-500/10';
  const textAccent = theme === 'green' ? 'text-emerald-400' : 'text-pink-400';

  return (
    <div className={`rounded-2xl border ${accent} backdrop-blur-xl p-4`} role="region" aria-label="Dnešný rozvrh">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className={`w-5 h-5 ${textAccent}`} aria-hidden="true" />
        <h3 className="font-bold text-white">Dnešný rozvrh</h3>
      </div>
      <div className="space-y-2">
        {lessons.length > 0 ? lessons.map((lesson, i) => {
           // Simple check for "current" lesson (mock logic or real time check needed)
           const isCurrent = i === 0; 
           return (
            <div 
              key={i} 
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                isCurrent
                  ? `${accent} ring-2 ${theme === 'green' ? 'ring-emerald-500' : 'ring-pink-500'}` 
                  : 'hover:bg-white/5'
              }`}
            >
              <span className={`font-mono text-sm ${isCurrent ? textAccent : 'text-white/50'}`}>
                {lesson.start}
              </span>
              <div className="flex-1">
                <p className={`font-semibold ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                  {lesson.subject}
                </p>
                <p className="text-xs text-white/40">{lesson.room || 'Trieda'}</p>
              </div>
              {isCurrent && (
                <span className={`text-xs font-bold ${textAccent} animate-pulse`}>TERAZ</span>
              )}
            </div>
          );
        }) : (
            <p className="text-center text-white/50 py-4">Žiadne hodiny na dnes</p>
        )}
      </div>
    </div>
  );
};

// Grades Card
const GradesCard = ({ theme, grades }: { theme: 'green' | 'pink', grades: Grade[] }) => {
  const accent = theme === 'green' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-pink-500/50 bg-pink-500/10';
  const textAccent = theme === 'green' ? 'text-emerald-400' : 'text-pink-400';
  
  const getGradeColor = (gradeValue: string) => {
    // Handle string grades (e.g. "1" or "1-")
    const num = parseInt(gradeValue);
    if (isNaN(num)) return 'bg-gray-500';

    if (num === 1) return 'bg-green-500';
    if (num === 2) return 'bg-lime-500';
    if (num === 3) return 'bg-yellow-500';
    if (num === 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`rounded-2xl border ${accent} backdrop-blur-xl p-4`} role="region" aria-label="Posledné známky">
      <div className="flex items-center gap-2 mb-4">
        <Award className={`w-5 h-5 ${textAccent}`} aria-hidden="true" />
        <h3 className="font-bold text-white">Posledné známky</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {grades.length > 0 ? grades.slice(0, 6).map((g, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${getGradeColor(g.value)}`}>
              {g.value}
            </span>
            <div>
              <p className="font-semibold text-white/80">{g.subject}</p>
              <p className="text-xs text-white/40">
                {g.date ? new Date(g.date).toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' }) : ''}
              </p>
            </div>
          </div>
        )) : (
            <p className="col-span-2 text-center text-white/50 py-4">Žiadne známky</p>
        )}
      </div>
    </div>
  );
};

// Notices Card
const NoticesCard = ({ theme, notices }: { theme: 'green' | 'pink', notices: TimelineItem[] }) => {
  const accent = theme === 'green' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-pink-500/50 bg-pink-500/10';
  const textAccent = theme === 'green' ? 'text-emerald-400' : 'text-pink-400';

  return (
    <div className={`rounded-2xl border ${accent} backdrop-blur-xl p-4`} role="region" aria-label="Oznamy">
      <div className="flex items-center gap-2 mb-4">
        <Bell className={`w-5 h-5 ${textAccent}`} aria-hidden="true" />
        <h3 className="font-bold text-white">Oznamy</h3>
      </div>
      <div className="space-y-2">
        {notices.length > 0 ? notices.slice(0, 3).map((notice, i) => (
          <div key={i} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="font-medium text-white">
                  {notice.title || 'Oznam'}
                </p>
                <p className="text-xs text-white/40">
                    {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('sk-SK') : ''}
                </p>
              </div>
            </div>
          </div>
        )) : (
            <p className="text-center text-white/50 py-4">Žiadne oznamy</p>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function SchoolDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'green' | 'pink'>(() => {
    return (localStorage.getItem('dashboardTheme') as 'green' | 'pink') || 'green';
  });

  // EduPage Logic
  const { snapshot, loading, error, isAuthenticated, login, logout, refresh } = useEdupage();
  
  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ebuid, setEbuid] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('dashboardTheme', theme);
  }, [theme]);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginLoading(true);
      await login(username, password, ebuid);
      setLoginLoading(false);
  };

  const bgImage = theme === 'green' ? greenBg : pinkBg;
  const accentColor = theme === 'green' ? 'text-emerald-400' : 'text-pink-400';
  const buttonAccent = theme === 'green' 
    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50' 
    : 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/50';

  return (
    <div className="relative min-h-dvh w-full overflow-hidden text-white">
      {/* Background */}
      <img 
        src={bgImage} 
        alt="Dashboard Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Educational Particles */}
      <EducationalParticles theme={theme} />

      {/* Content */}
      <div className="relative z-20 min-h-dvh flex flex-col safe-area-inset">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 backdrop-blur-md bg-black/20 sticky top-0 z-30">
          <button 
            onClick={() => navigate('/home')}
            className={`p-2 rounded-full ${buttonAccent} border transition-colors`}
            aria-label="Späť na hlavnú stránku"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          
          <h1 className={`font-black text-xl tracking-wider ${accentColor}`}>
            ŠKOLA
          </h1>
          
          <div className="flex gap-2">
             {isAuthenticated && (
                <button 
                    onClick={logout}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 transition-colors"
                >
                    <LogOut className="w-5 h-5 text-red-400" />
                </button>
             )}
            <button 
                onClick={() => setTheme(theme === 'green' ? 'pink' : 'green')}
                className={`p-2 rounded-full ${buttonAccent} border transition-colors`}
            >
                {theme === 'green' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-6 overflow-auto pb-24">
           {/* Clock at the top */}
           <Clock />

           {loading && !snapshot ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className={`w-12 h-12 ${accentColor} animate-spin mb-4`} />
                <p className="text-white/60">Načítavam školské dáta...</p>
             </div>
           ) : !isAuthenticated ? (
               // Login Form
               <div className="max-w-md mx-auto space-y-6 bg-black/30 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Prihlás sa</h2>
                    <p className="text-white/60 text-sm">Pre zobrazenie známok a rozvrhu</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Meno (napr. janko.hrasko)"
                        required
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Heslo"
                        required
                      />
                      <input
                        type="text"
                        value={ebuid}
                        onChange={(e) => setEbuid(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="ID školy (napr. zskostolany)"
                        required
                      />
                      
                      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className={`w-full py-4 rounded-xl ${theme === 'green' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-pink-500 hover:bg-pink-600'} font-bold flex items-center justify-center gap-2 transition-all active:scale-95`}
                      >
                        {loginLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <LogIn className="w-5 h-5" />}
                        {loginLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
                      </button>
                  </form>
                  {/* Mock Login Hint */}
                  <p className="text-center text-xs text-white/30">
                     Tip: Pre demo režim stačí kliknúť "Prihlásiť sa" s hocijakými údajmi.
                  </p>
               </div>
           ) : (
             // Authenticated Dashboard
             <>
                <TimetableCard theme={theme} lessons={snapshot?.timetable || []} />
                <GradesCard theme={theme} grades={snapshot?.grades || []} />
                <NoticesCard theme={theme} notices={snapshot?.timeline || []} />
             </>
           )}
        </main>
      </div>
    </div>
  );
}
