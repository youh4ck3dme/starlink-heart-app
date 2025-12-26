import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Calendar, Award, Bell } from 'lucide-react';

// Backgrounds
import greenBg from '../assets/dashboard-bg.png';
import pinkBg from '../assets/dashboard-bg-pink.png';

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
const TimetableCard = ({ theme }: { theme: 'green' | 'pink' }) => {
  const accent = theme === 'green' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-pink-500/50 bg-pink-500/10';
  const textAccent = theme === 'green' ? 'text-emerald-400' : 'text-pink-400';
  
  const lessons = [
    { time: '08:00', subject: 'Matematika', teacher: 'Mgr. Nováková', current: true },
    { time: '08:45', subject: 'Slovenský jazyk', teacher: 'PhDr. Kováč', current: false },
    { time: '09:40', subject: 'Anglický jazyk', teacher: 'Bc. Smith', current: false },
    { time: '10:35', subject: 'Fyzika', teacher: 'RNDr. Horák', current: false },
  ];

  return (
    <div className={`rounded-2xl border ${accent} backdrop-blur-xl p-4`}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className={`w-5 h-5 ${textAccent}`} />
        <h3 className="font-bold text-white">Dnešný rozvrh</h3>
      </div>
      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <div 
            key={i} 
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              lesson.current 
                ? `${accent} ring-2 ${theme === 'green' ? 'ring-emerald-500' : 'ring-pink-500'}` 
                : 'hover:bg-white/5'
            }`}
          >
            <span className={`font-mono text-sm ${lesson.current ? textAccent : 'text-white/50'}`}>
              {lesson.time}
            </span>
            <div className="flex-1">
              <p className={`font-semibold ${lesson.current ? 'text-white' : 'text-white/70'}`}>
                {lesson.subject}
              </p>
              <p className="text-xs text-white/40">{lesson.teacher}</p>
            </div>
            {lesson.current && (
              <span className={`text-xs font-bold ${textAccent} animate-pulse`}>TERAZ</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Grades Card
const GradesCard = ({ theme }: { theme: 'green' | 'pink' }) => {
  const accent = theme === 'green' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-pink-500/50 bg-pink-500/10';
  const textAccent = theme === 'green' ? 'text-emerald-400' : 'text-pink-400';
  
  const grades = [
    { subject: 'MAT', grade: 1, date: '20.12.' },
    { subject: 'SJL', grade: 2, date: '19.12.' },
    { subject: 'ANJ', grade: 1, date: '18.12.' },
    { subject: 'FYZ', grade: 1, date: '17.12.' },
  ];

  const getGradeColor = (grade: number) => {
    if (grade === 1) return 'bg-green-500';
    if (grade === 2) return 'bg-lime-500';
    if (grade === 3) return 'bg-yellow-500';
    if (grade === 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`rounded-2xl border ${accent} backdrop-blur-xl p-4`}>
      <div className="flex items-center gap-2 mb-4">
        <Award className={`w-5 h-5 ${textAccent}`} />
        <h3 className="font-bold text-white">Posledné známky</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {grades.map((g, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${getGradeColor(g.grade)}`}>
              {g.grade}
            </span>
            <div>
              <p className="font-semibold text-white/80">{g.subject}</p>
              <p className="text-xs text-white/40">{g.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Notices Card
const NoticesCard = ({ theme }: { theme: 'green' | 'pink' }) => {
  const accent = theme === 'green' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-pink-500/50 bg-pink-500/10';
  const textAccent = theme === 'green' ? 'text-emerald-400' : 'text-pink-400';
  
  const notices = [
    { title: 'Nová úloha z matematiky', time: 'Pred 2 hodinami', urgent: true },
    { title: 'Triedna schôdza 15.1.', time: 'Včera', urgent: false },
    { title: 'Prázdniny od 23.12.', time: 'Pred 3 dňami', urgent: false },
  ];

  return (
    <div className={`rounded-2xl border ${accent} backdrop-blur-xl p-4`}>
      <div className="flex items-center gap-2 mb-4">
        <Bell className={`w-5 h-5 ${textAccent}`} />
        <h3 className="font-bold text-white">Oznamy</h3>
      </div>
      <div className="space-y-2">
        {notices.map((notice, i) => (
          <div key={i} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-start gap-2">
              {notice.urgent && (
                <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${notice.urgent ? 'text-white' : 'text-white/70'}`}>
                  {notice.title}
                </p>
                <p className="text-xs text-white/40">{notice.time}</p>
              </div>
            </div>
          </div>
        ))}
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

  useEffect(() => {
    localStorage.setItem('dashboardTheme', theme);
  }, [theme]);

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
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Educational Particles */}
      <EducationalParticles theme={theme} />

      {/* Content */}
      <div className="relative z-20 min-h-dvh flex flex-col safe-area-inset">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 backdrop-blur-md bg-black/20">
          <button 
            onClick={() => navigate('/home')}
            className={`p-2 rounded-full ${buttonAccent} border transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className={`font-black text-xl tracking-wider ${accentColor}`}>
            ŠKOLA
          </h1>
          
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'green' ? 'pink' : 'green')}
            className={`p-2 rounded-full ${buttonAccent} border transition-colors`}
            aria-label={theme === 'green' ? 'Prepnúť na ružovú tému' : 'Prepnúť na zelenú tému'}
          >
            {theme === 'green' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </header>

        {/* Dashboard Cards */}
        <main className="flex-1 p-4 space-y-4 overflow-auto pb-20">
          <TimetableCard theme={theme} />
          <GradesCard theme={theme} />
          <NoticesCard theme={theme} />
        </main>
      </div>
    </div>
  );
}
