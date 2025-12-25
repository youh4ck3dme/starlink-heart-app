import { useState } from 'react';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (settings: {
    selectedAvatar: string;
    theme: string;
    apiKey: string;
  }) => void;
  onDeleteAll: () => void;
  initialAvatar?: string;
  initialTheme?: string;
  initialApiKey?: string;
  initial3DEnabled?: boolean;
}

const AVATARS = [
  { id: "iskra", label: "Iskra", emoji: "✨" },
  { id: "raketa", label: "Raketa", emoji: "🚀" },
  { id: "robo", label: "Robo", emoji: "🤖" },
  { id: "genius", label: "Génius", emoji: "🧠" },
  { id: "lumen", label: "Lumen", emoji: "💡" },
];

const THEMES = [
  {
    id: "light",
    label: "Svetlá obloha",
    preview: "bg-gradient-to-b from-sky-100 to-blue-50",
  },
  {
    id: "space",
    label: "Nočný vesmír",
    preview: "bg-gradient-to-b from-indigo-950 to-slate-900",
  },
];

export default function SettingsModal({
  onClose,
  onSave,
  onDeleteAll,
  initialAvatar = "iskra",
  initialTheme = "light",
  initialApiKey = "",
  initial3DEnabled = false,
}: SettingsModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);
  const [theme, setTheme] = useState(initialTheme);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [enable3D, setEnable3D] = useState(() => localStorage.getItem('enable3DMascot') === 'true');

  const handleSave = () => {
    onSave({ selectedAvatar, theme, apiKey });
    localStorage.setItem('enable3DMascot', String(enable3D));
    if (localStorage.getItem('enable3DMascot') !== String(initial3DEnabled)) {
      window.location.reload();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in-up motion-reduce:animate-none"
      style={{ 
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))'
      }}
    >
      {/* Overlay */}
      <button
        aria-label="Zatvoriť"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-[520px] max-h-[90svh] overflow-hidden rounded-3xl bg-white shadow-[0_30px_100px_rgba(0,0,0,0.4)] flex flex-col">
        
        {/* Header - stable */}
        <div className="relative shrink-0 px-5 pt-5 pb-4 border-b border-gray-100 bg-white">
          {/* Close X - 44px hit area */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 motion-reduce:transition-none"
            aria-label="Zatvoriť"
          >
            <span className="text-gray-600 text-lg font-bold">✕</span>
          </button>

          <h2 className="text-center text-xl font-black tracking-tight text-gray-900">Vzhľad a téma</h2>
          <p className="text-center text-gray-500 text-sm mt-1">
            Nastav si avatara, prostredie a vlastný kľúč.
          </p>
        </div>

        {/* Scroll Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-5">
          
          {/* SECTION: AVATAR */}
          <section className="rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/80 to-white p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Tvôj Avatar</div>
                <div className="text-sm font-semibold text-gray-700 mt-0.5">Vyber si parťáka</div>
              </div>
              <div className="text-xs text-gray-400">tapni na kartu</div>
            </div>

            {/* Avatar Grid - consistent sizing */}
            <div className="grid grid-cols-3 gap-2.5">
              {AVATARS.map((a) => {
                const active = selectedAvatar === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAvatar(a.id)}
                    className={[
                      "group relative rounded-2xl p-3 text-center min-h-[88px] flex flex-col items-center justify-center",
                      "border-2 bg-white",
                      "transition-all duration-150",
                      "active:scale-[0.97]",
                      "motion-reduce:transform-none motion-reduce:transition-none",
                      active
                        ? "border-sky-500 bg-sky-50 shadow-lg shadow-sky-500/20"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {/* Sparkle only on active - respect reduced motion */}
                    {active && (
                      <div className="absolute -inset-1 rounded-[18px] pointer-events-none motion-reduce:hidden" aria-hidden>
                        <div className="absolute inset-0 rounded-[18px] blur-md opacity-40 animate-sh-sparklePulse bg-gradient-to-r from-sky-400 to-indigo-400" />
                      </div>
                    )}

                    <div className="relative text-3xl group-hover:scale-110 transition-transform duration-150 motion-reduce:transform-none">
                      {a.emoji}
                    </div>
                    <div className="relative mt-1.5 text-xs font-bold text-gray-800">{a.label}</div>

                    {active && (
                      <div className="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION: THEME */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Prostredie</div>
            <div className="text-sm font-semibold text-gray-700 mt-0.5 mb-4">Ako má vyzerať appka</div>

            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={[
                      "relative overflow-hidden rounded-2xl border-2 p-3 text-left transition-all",
                      "active:scale-[0.98] motion-reduce:transform-none",
                      active 
                        ? "border-sky-500 shadow-lg shadow-sky-500/20" 
                        : "border-gray-100 hover:border-gray-200",
                    ].join(" ")}
                  >
                    <div className={["h-16 w-full rounded-xl", t.preview].join(" ")} />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm font-bold text-gray-900">{t.label}</div>
                      {active && <span className="text-xs font-bold text-sky-600">Zvolené</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION: API KEY - visually secondary */}
          <section className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Vlastný API Kľúč</div>
                <div className="text-sm font-medium text-gray-600 mt-0.5">Voliteľné (pre rodiča)</div>
              </div>
              <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-white rounded-full border border-gray-200">Gemini</span>
            </div>

            <div className="mt-3">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Vlož Gemini API Key…"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all"
              />
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Ak necháš prázdne, použije sa demo kľúč. Na produkciu odporúčam vlastný.
              </p>
            </div>
          </section>

          {/* SECTION: 3D MASCOT (BETA) */}
          <section className="rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-indigo-600/70 uppercase">3D Maskot (Beta)</div>
                <div className="text-sm font-semibold text-indigo-900 mt-0.5">Prof. StarLink v 3D</div>
              </div>
              
              <button
                onClick={() => setEnable3D(!enable3D)}
                className={`relative w-14 h-8 rounded-full transition-colors duration-200 motion-reduce:transition-none ${
                  enable3D ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
                aria-label={enable3D ? "Vypnúť 3D" : "Zapnúť 3D"}
              >
                <div 
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 motion-reduce:transition-none ${
                    enable3D ? 'translate-x-6' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>
            <p className="mt-2 text-xs text-indigo-800/60">
              Viac efektov, môže viac žrať batériu. Vyžaduje reštart apky.
            </p>
          </section>

          {/* SECTION: DANGER ZONE */}
          <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
            <div className="text-xs font-bold tracking-widest text-red-600 uppercase">⚠️ Nebezpečná zóna</div>
            <div className="text-sm font-semibold text-red-900 mt-1">Vymaže všetko lokálne v zariadení</div>
            <p className="text-xs text-red-800/70 mt-2 leading-relaxed">
              Zmaže chat, profil, nastavenia a súhlas. Táto akcia sa nedá vrátiť späť!
            </p>

            <button
              onClick={onDeleteAll}
              className="mt-4 w-full rounded-2xl bg-red-600 text-white py-3.5 font-bold shadow-lg shadow-red-600/25 active:scale-[0.98] transition-all hover:bg-red-700 motion-reduce:transition-none"
            >
              🗑️ Vymazať všetky dáta
            </button>
          </section>

          {/* Bottom spacer for sticky bar */}
          <div className="h-4" />
        </div>

        {/* Sticky Bottom Bar */}
        <div 
          className="shrink-0 border-t border-gray-100 bg-white/95 backdrop-blur-sm px-5 py-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={handleSave}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-500 to-amber-500 py-4 font-extrabold text-white shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-transform motion-reduce:transition-none"
          >
            Uložiť zmeny
          </button>
        </div>
      </div>
    </div>
  );
}
