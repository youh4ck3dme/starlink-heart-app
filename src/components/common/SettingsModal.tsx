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
    preview: "bg-[radial-gradient(circle_at_30%_20%,rgba(90,174,255,0.45),transparent_55%),linear-gradient(#f6fbff,#eaf3ff)]",
  },
  {
    id: "space",
    label: "Nočný vesmír",
    preview: "bg-[radial-gradient(circle_at_35%_25%,rgba(120,90,255,0.45),transparent_55%),linear-gradient(#070a22,#040515)]",
  },
];

export default function SettingsModal({
  onClose,
  onSave,
  onDeleteAll,
  initialAvatar = "iskra",
  initialTheme = "light",
  initialApiKey = "",
}: SettingsModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);
  const [theme, setTheme] = useState(initialTheme);
  const [apiKey, setApiKey] = useState(initialApiKey);

  const handleSave = () => {
    onSave({ selectedAvatar, theme, apiKey });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in-up">
      {/* Overlay */}
      <button
        aria-label="Zatvoriť"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-black/5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 h-9 w-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all"
            aria-label="Zatvoriť"
          >
            ✕
          </button>

          <h2 className="text-center text-xl font-extrabold tracking-tight">Vzhľad a téma</h2>
          <p className="text-center text-black/50 text-sm mt-1">
            Nastav si avatara, prostredie a (ak chceš) vlastný kľúč.
          </p>
        </div>

        {/* Scroll Body */}
        <div className="max-h-[72svh] overflow-y-auto px-6 py-5 space-y-5">
          {/* SECTION: AVATAR */}
          <section className="rounded-2xl border border-black/5 bg-gradient-to-b from-[#f7fbff] to-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-black/40">TVÔJ AVATAR</div>
                <div className="text-sm font-semibold text-black/70 mt-1">Vyber si parťáka</div>
              </div>
              <div className="text-xs text-black/40">tapni na kartu</div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {AVATARS.map((a) => {
                const active = selectedAvatar === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAvatar(a.id)}
                    className={[
                      "relative rounded-2xl p-3 text-left transition",
                      "border bg-white",
                      active
                        ? "border-[#5aaeff] ring-2 ring-[#5aaeff]/35 shadow-[0_10px_30px_rgba(90,174,255,0.25)]"
                        : "border-black/5 hover:border-black/10 hover:bg-black/[0.02]",
                    ].join(" ")}
                  >
                    <div className="text-2xl">{a.emoji}</div>
                    <div className="mt-2 text-sm font-extrabold">{a.label}</div>
                    {active && (
                      <div className="absolute right-2 top-2 h-6 w-6 rounded-full bg-[#5aaeff] text-white flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION: THEME */}
          <section className="rounded-2xl border border-black/5 bg-white p-4">
            <div className="text-xs font-bold tracking-widest text-black/40">PROSTREDIE</div>
            <div className="text-sm font-semibold text-black/70 mt-1">Ako má vyzerať appka</div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {THEMES.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={[
                      "relative overflow-hidden rounded-2xl border p-3 text-left transition",
                      active ? "border-[#5aaeff] ring-2 ring-[#5aaeff]/30" : "border-black/5 hover:border-black/10",
                    ].join(" ")}
                  >
                    <div className={["h-14 w-full rounded-xl", t.preview].join(" ")} />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm font-extrabold">{t.label}</div>
                      {active && <span className="text-xs font-bold text-[#2b7fff]">Zvolené</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION: API KEY */}
          <section className="rounded-2xl border border-black/5 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-black/40">VLASTNÝ API KĽÚČ</div>
                <div className="text-sm font-semibold text-black/70 mt-1">Voliteľné (pre rodiča)</div>
              </div>
              <span className="text-xs text-black/40">Gemini</span>
            </div>

            <div className="mt-3">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Vlož Gemini API Key…"
                className="w-full rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#5aaeff]/40 transition"
              />
              <div className="mt-2 text-xs text-black/45">
                Ak necháš prázdne, použije sa demo kľúč. (Na produkciu odporúčam vlastný.)
              </div>
            </div>
          </section>

          {/* SECTION: DANGER ZONE */}
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="text-xs font-bold tracking-widest text-red-700/70">NEBEZPEČNÁ ZÓNA</div>
            <div className="text-sm font-semibold text-red-900 mt-1">Vymaže všetko lokálne v zariadení</div>
            <div className="text-xs text-red-900/60 mt-2">
              Zmaže chat, profil, nastavenia a súhlas. Nedá sa vrátiť späť.
            </div>

            <button
              onClick={onDeleteAll}
              className="mt-4 w-full rounded-2xl bg-red-600 text-white py-3 font-extrabold shadow-[0_12px_30px_rgba(220,38,38,0.25)] active:scale-[0.99] transition-all hover:bg-red-700"
            >
              🗑️ Vymazať všetky dáta
            </button>
          </section>

          {/* Spacer for sticky bar */}
          <div className="h-20" />
        </div>

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-0 border-t border-black/5 bg-white/90 backdrop-blur px-6 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <button
            onClick={handleSave}
            className="w-full rounded-2xl bg-gradient-to-r from-[#5b6dff] via-[#21c6ff] to-[#ffb357] py-4 font-extrabold text-white shadow-[0_18px_45px_rgba(0,0,0,0.20)] active:scale-[0.99] transition-all"
          >
            Uložiť zmeny
          </button>
        </div>
      </div>
    </div>
  );
}
