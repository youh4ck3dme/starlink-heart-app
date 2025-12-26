import { getPlayerStats } from '../../services/xpService';
import { BadgeShowcase } from '../gamification/BadgeShowcase';

interface ProfileModalProps {
  onClose: () => void;
  profileName?: string;
  gems?: number;
  hearts?: number | string;
}

export default function ProfileModal({ 
  onClose, 
  profileName,
  gems = 0,
  hearts = "∞"
}: ProfileModalProps) {
  const stats = getPlayerStats();
  const progressPct = stats.progress;

  return (
    <>
      {/* Overlay - fixed fullscreen with safe area padding */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-up motion-reduce:animate-none"
        style={{ 
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))'
        }}
      >
        {/* Backdrop */}
        <button
          aria-label="Zatvoriť"
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-[420px] max-h-[85svh] overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.4)] flex flex-col motion-reduce:animate-none border border-white/20">
          
          {/* Header gradient - stable */}
          <div className="relative shrink-0 px-6 pt-6 pb-5 bg-gradient-to-r from-[#6a5cff] via-[#5aaeff] to-[#7c4dff]">
            {/* Close X - 44px hit area for accessibility */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors active:scale-95 motion-reduce:transition-none"
              aria-label="Zatvoriť"
            >
              <span className="text-lg font-bold">✕</span>
            </button>

            {/* Avatar */}
            <div className="mx-auto w-18 h-18 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg">
              ✨
            </div>

            {/* Name + rank */}
            <div className="mt-4 text-center text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                <span>Level {stats.level}</span>
              </div>

              <h3 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
                {profileName ?? stats.title}
              </h3>

              <p className="mt-1.5 text-white/90 text-sm font-medium">
                Prieskumník vesmíru 🚀
              </p>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 overscroll-contain">
            {/* Stats Grid - consistent height cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-b from-amber-50 to-white p-4 min-h-[110px] flex flex-col">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                  💎 Drahokamy
                </div>
                <div className="mt-auto text-3xl font-black text-gray-900">{gems}</div>
                <div className="mt-1 text-xs text-gray-500">Získané za misie</div>
              </div>

              <div className="rounded-2xl border border-sky-200/60 bg-gradient-to-b from-sky-50 to-white p-4 min-h-[110px] flex flex-col">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-700">
                  ❤️ Srdiečka
                </div>
                <div className="mt-auto text-3xl font-black text-gray-900">{hearts}</div>
                <div className="mt-1 text-xs text-gray-500">Energia na učenie</div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="rounded-2xl border border-black/5 bg-gray-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                <span>Postup do Level {stats.level + 1}</span>
                <span className="font-bold">{progressPct}%</span>
              </div>
              <div className="mt-2.5 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6a5cff] to-[#5aaeff] transition-all duration-500 motion-reduce:transition-none"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                {stats.xp} XP • Ešte {stats.xpToNextLevel} na ďalší level
              </div>
            </div>

            {/* Badges */}
            <BadgeShowcase />


            {/* Streak Badge */}
            {stats.streak > 0 && (
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 px-4 py-4">
                <div className="text-3xl">🔥</div>
                <div>
                  <div className="text-base font-bold text-orange-900">{stats.streak} dní v rade!</div>
                  <div className="text-xs text-orange-700/80">Pokračuj ďalej!</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - stable */}
          <div 
            className="shrink-0 border-t border-black/5 bg-white/50 backdrop-blur-sm px-5 py-4"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-gray-900 text-white py-4 font-extrabold shadow-lg active:scale-[0.98] transition-transform motion-reduce:transition-none"
            >
              Pokračovať 🚀
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2 rounded-2xl bg-gray-100 text-gray-700 py-3 font-semibold hover:bg-gray-200 transition-colors motion-reduce:transition-none"
            >
              Zatvoriť
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
