import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, LogOut, RefreshCw, GraduationCap, Calendar, Bell, Loader2 } from 'lucide-react';
import { useEdupage } from '../features/edupage/hooks/useEdupage';

export default function SchoolPage() {
  const navigate = useNavigate();
  const { snapshot, loading, error, isAuthenticated, login, logout, refresh } = useEdupage();
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ebuid, setEbuid] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    await login(username, password, ebuid);
    setLoginLoading(false);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#060819] to-[#0f172a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 backdrop-blur-md bg-[#060819]/80 border-b border-white/10">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Späť"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-sky-400" />
          <h1 className="text-xl font-bold">EduPage</h1>
        </div>
        
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                aria-label="Obnoviť"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                aria-label="Odhlásiť"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Not Authenticated - Show Login */}
        {!isAuthenticated && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <GraduationCap className="w-16 h-16 mx-auto text-sky-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Prihlás sa do EduPage</h2>
              <p className="text-white/60">Zobraz si známky, rozvrh a oznamy priamo v appke</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Používateľské meno
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="meno.priezvisko"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Heslo
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Škola (EBUID)
                </label>
                <input
                  type="text"
                  value={ebuid}
                  onChange={(e) => setEbuid(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="nazov-skoly"
                  required
                />
                <p className="text-xs text-white/40 mt-1">
                  Nájdeš v URL: https://<strong>nazov-skoly</strong>.edupage.org
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 font-bold text-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Prihlasujem...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Prihlásiť sa
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-white/40">
              Tvoje údaje sú bezpečne spracované. Viď{' '}
              <a href="/privacy" className="text-sky-400 underline">Zásady ochrany súkromia</a>
            </p>
          </div>
        )}

        {/* Authenticated - Show Data */}
        {isAuthenticated && (
          <>
            {loading && !snapshot ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-sky-400 animate-spin mb-4" />
                <p className="text-white/60">Načítavam dáta z EduPage...</p>
              </div>
            ) : snapshot ? (
              <div className="space-y-4">
                {/* Grades Card */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold">Známky ({snapshot.grades.length})</h3>
                  </div>
                  
                  {snapshot.grades.length > 0 ? (
                    <div className="space-y-2">
                      {snapshot.grades.slice(0, 5).map((grade) => (
                        <div key={grade.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span className="font-medium">{grade.subject}</span>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            {grade.value}
                          </span>
                        </div>
                      ))}
                      {snapshot.grades.length > 5 && (
                        <p className="text-sm text-white/50 text-center mt-2">
                          +{snapshot.grades.length - 5} ďalších známok
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/50 text-center py-4">Žiadne známky</p>
                  )}
                </div>

                {/* Timeline Card */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold">Oznamy ({snapshot.timeline.length})</h3>
                  </div>
                  
                  {snapshot.timeline.length > 0 ? (
                    <div className="space-y-2">
                      {snapshot.timeline.slice(0, 3).map((item) => (
                        <div key={item.id} className="p-2 rounded-lg bg-white/5">
                          <p className="font-medium">{item.title || 'Oznam'}</p>
                          {item.body && (
                            <p className="text-sm text-white/50 line-clamp-2">{item.body}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 text-center py-4">Žiadne oznamy</p>
                  )}
                </div>

                {/* Timetable Card */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-sky-400" />
                    <h3 className="font-bold">Rozvrh ({snapshot.timetable.length})</h3>
                  </div>
                  
                  {snapshot.timetable.length > 0 ? (
                    <div className="space-y-2">
                      {snapshot.timetable.slice(0, 4).map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                          <span className="text-sm font-mono text-white/50">{lesson.start}</span>
                          <span className="font-medium">{lesson.subject}</span>
                          {lesson.room && <span className="text-sm text-white/40">{lesson.room}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 text-center py-4">Žiadne hodiny</p>
                  )}
                </div>

                {/* Last Updated */}
                <p className="text-center text-xs text-white/40">
                  Aktualizované: {new Date(snapshot.fetchedAt).toLocaleString('sk-SK')}
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={refresh}
                  className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Skúsiť znova
                </button>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
