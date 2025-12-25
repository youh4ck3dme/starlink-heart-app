import { getPlayerStats } from '../../services/xpService';

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
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-up">
        <button
          aria-label="Zatvoriť"
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] animate-float">
          {/* Header gradient */}
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-[#6a5cff] via-[#5aaeff] to-[#7c4dff]">
            {/* Close X */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/20 hover:bg-white/30 text-white w-9 h-9 flex items-center justify-center transition-all"
              aria-label="Zatvoriť"
            >
              ✕
            </button>

            {/* Avatar */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              ✨
            </div>

            {/* Name + rank */}
            <div className="mt-3 text-center text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                <span className="opacity-90">Level {stats.level}</span>
              </div>

              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
                {profileName ?? stats.title}
              </h3>

              <p className="mt-1 text-white/85 text-sm">
                Prieskumník vesmíru 🚀
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-[#fff7d6] to-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#9a7b00]">
                  💎 Drahokamy
                </div>
                <div className="mt-2 text-3xl font-black text-[#1f2a37]">{gems}</div>
                <div className="mt-1 text-xs text-black/45">Získané za misie</div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-[#e8f3ff] to-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1f5aa6]">
                  ❤️ Srdiečka
                </div>
                <div className="mt-2 text-3xl font-black text-[#1f2a37]">{hearts}</div>
                <div className="mt-1 text-xs text-black/45">Energia na učenie</div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-black/55">
                <span>Postup do Level {stats.level + 1}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6a5cff] to-[#5aaeff] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-black/45 text-center">
                {stats.xp} XP • Ešte {stats.xpToNextLevel} na ďalší level
              </div>
            </div>

            {/* Streak Badge */}
            {stats.streak > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 px-4 py-3">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="text-sm font-bold text-orange-900">{stats.streak} dní v rade!</div>
                  <div className="text-xs text-orange-700">Pokračuj ďalej!</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 pb-[max(0px,env(safe-area-inset-bottom))]">
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-[#111827] text-white py-4 font-extrabold shadow-[0_18px_40px_rgba(0,0,0,0.20)] active:scale-[0.99] transition-all"
              >
                Pokračovať 🚀
              </button>

              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-black/5 text-black/70 py-3 font-semibold hover:bg-black/10 transition-all"
              >
                Zatvoriť
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
