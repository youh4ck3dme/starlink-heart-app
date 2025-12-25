import React from 'react';

interface ParentNoticeProps {
  onAccept: () => void;
  onCancel: () => void;
}

/**
 * Parent Notice Modal - COPPA/GDPR consent gate
 * 
 * Must be shown before first AI interaction.
 * Slovak copy, parent-friendly language.
 */
export default function ParentNotice({ onAccept, onCancel }: ParentNoticeProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍👩‍👧</span>
            <h2 className="text-white font-bold text-xl">Informácia pre rodiča</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Starlink Heart</strong> používa umelú inteligenciu (AI) na pomoc s domácimi úlohami.
          </p>

          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <span className="text-xl">🤖</span>
              <p className="text-sm text-gray-700">
                Správy a prípadné obrázky úloh sú spracované AI službami (Google Gemini).
              </p>
            </div>
            
            <div className="flex gap-3">
              <span className="text-xl">🔒</span>
              <p className="text-sm text-gray-700">
                <strong>Nepíšte osobné údaje</strong> do chatu (meno, adresa, telefón, email).
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-xl">🗑️</span>
              <p className="text-sm text-gray-700">
                Všetky dáta sú uložené lokálne. Môžete ich kedykoľvek vymazať v nastaveniach.
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Pokračovaním potvrdzujete, že ste rodič alebo zákonný zástupca a súhlasíte s týmito podmienkami.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 text-gray-600 font-semibold rounded-xl 
                       border-2 border-gray-200 hover:bg-gray-100 
                       transition-colors"
          >
            Zrušiť
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
                       text-white font-bold rounded-xl shadow-lg
                       hover:from-blue-700 hover:to-indigo-700
                       active:scale-95 transition-all"
          >
            Som rodič – súhlasím ✓
          </button>
        </div>
      </div>
    </div>
  );
}
