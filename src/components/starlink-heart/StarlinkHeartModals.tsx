import React from 'react';
import { BackgroundItem, BACKGROUND_OPTIONS, AVATAR_OPTIONS } from '../../core/config/shopConfig';
import { getLevelTitle } from '../../features/gamification/context/GamificationContext';
import StarryAvatarDisplay from '../common/StarryAvatarDisplay';
import CameraModal from '../camera/CameraModal';
import ParentNotice from '../ParentNotice';
import { VoiceMode } from './StarlinkHeartPanels';
import { MascotMode } from '../mascot/MascotRenderer';

const FormatText = ({ text }: { text: string }) => {
  if (!text) return null;

  const parts = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const content = part.slice(2, -2);
          return (
            <span key={i} className="inline-block bg-yellow-100 text-yellow-800 px-1.5 rounded border-b-2 border-yellow-400 font-semibold mx-0.5 shadow-sm transform hover:scale-105 transition-transform cursor-default" title="Kľúčový pojem">
              {content}
            </span>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={i} className="font-bold text-inherit">{part.slice(1, -1)}</strong>;
        }
        return part;
      })}
    </span>
  );
};

type StarlinkHeartModalsProps = {
  showParentNotice: boolean;
  onConsentAccept: () => Promise<void> | void;
  onConsentCancel: () => void;
  activeParentGuide: string | null;
  onCloseParentGuide: () => void;
  showCameraModal: boolean;
  onCloseCameraModal: () => void;
  onPhotoTaken: (file: File) => void;
  showProfileModal: boolean;
  onCloseProfileModal: () => void;
  starryAvatar: string;
  gemJustEarned: boolean;
  gems: number;
  showTipModal: boolean;
  isTipLoading: boolean;
  starryTip: string;
  onCloseTipModal: () => void;
  showCustomizeModal: boolean;
  onCloseCustomizeModal: () => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  appBackground: BackgroundItem;
  setAppBackground: (bg: BackgroundItem) => void;
  unlockedBackgrounds: string[];
  purchaseBackground: (bg: BackgroundItem) => boolean;
  level: number;
  voiceMode: VoiceMode;
  mascotMode: MascotMode;
  setMascotMode: (mode: MascotMode) => void;
  onSaveCustomization: () => void;
  showDeleteConfirm: boolean;
  onOpenDeleteConfirm: () => void;
  onCloseDeleteConfirm: () => void;
  onConfirmDelete: () => void;
};

const ParentGuideModal: React.FC<{
  activeParentGuide: string;
  onClose: () => void;
}> = ({ activeParentGuide, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      <div className="bg-indigo-600 p-4 flex justify-between items-center shrink-0">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <span>🛡️</span> Rodičovský Prekladač
        </h2>
        <button onClick={onClose} aria-label="Zatvoriť" className="text-white/80 hover:text-white text-2xl">&times;</button>
      </div>
      <div className="p-6 overflow-y-auto bg-indigo-50/50">
        <div className="prose prose-sm prose-indigo text-gray-700">
          <FormatText text={activeParentGuide} />
        </div>
      </div>
      <div className="p-4 bg-white border-t border-gray-100 text-center shrink-0">
        <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
          Rozumiem, som pripravený!
        </button>
      </div>
    </div>
  </div>
);

const ProfileModal: React.FC<{
  onClose: () => void;
  starryAvatar: string;
  gemJustEarned: boolean;
  gems: number;
}> = ({ onClose, starryAvatar, gemJustEarned, gems }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-white p-2 rounded-full shadow-lg mb-3">
          <StarryAvatarDisplay avatar={starryAvatar} isExcited={gemJustEarned} size="text-6xl" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-1">Kadet</h2>
        <p className="text-gray-500 text-sm mb-6">Prieskumník Vesmíru 🚀</p>

        <div className="grid grid-cols-2 gap-8 w-full mb-6">
          <div className="bg-yellow-50 rounded-2xl p-4 text-center border border-yellow-200">
            <div className="text-3xl mb-1">💎</div>
            <div className="font-bold text-2xl text-yellow-800">{gems}</div>
            <div className="text-xs text-yellow-600 uppercase font-bold tracking-wide">Drahokamy</div>
          </div>
          <div className="bg-sky-50 rounded-2xl p-4 text-center border border-sky-200">
            <div className="text-3xl mb-1">❤️</div>
            <div className="font-bold text-2xl text-sky-800">∞</div>
            <div className="text-xs text-sky-600 uppercase font-bold tracking-wide">Srdiečka</div>
          </div>
        </div>

        <button onClick={onClose} data-testid="close-profile-btn" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
          Zatvoriť
        </button>
      </div>
    </div>
  </div>
);

const TipModal: React.FC<{
  onClose: () => void;
  isTipLoading: boolean;
  starryTip: string;
}> = ({ onClose, isTipLoading, starryTip }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-pop-in">
    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 to-yellow-400" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-2">Starryho Tip 💡</h2>
      <div className="min-h-[100px] flex items-center justify-center text-gray-600 leading-relaxed text-lg">
        {isTipLoading ? <span className="animate-spin text-4xl">💫</span> : starryTip}
      </div>
      <button onClick={onClose} className="mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-full transition-colors w-full">
        Super!
      </button>
    </div>
  </div>
);

const CustomizationModal: React.FC<{
  onClose: () => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  appBackground: BackgroundItem;
  setAppBackground: (bg: BackgroundItem) => void;
  unlockedBackgrounds: string[];
  purchaseBackground: (bg: BackgroundItem) => boolean;
  level: number;
  gems: number;
  starryAvatar: string;
  voiceMode: VoiceMode;
  mascotMode: MascotMode;
  setMascotMode: (mode: MascotMode) => void;
  onSaveCustomization: () => void;
  onOpenDeleteConfirm: () => void;
}> = ({
  onClose,
  customApiKey,
  setCustomApiKey,
  appBackground,
  setAppBackground,
  unlockedBackgrounds,
  purchaseBackground,
  level,
  gems,
  starryAvatar,
  voiceMode,
  mascotMode,
  setMascotMode,
  onSaveCustomization,
  onOpenDeleteConfirm,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in-up">
    <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onClick={onClose} data-testid="close-settings-btn" className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl">&times;</button>

      <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Vzhľad a Téma</h3>

      <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          Tvoj Avatar
          <span className="text-indigo-600 font-bold">Level {level}</span>
        </div>
        <span className="text-indigo-500 font-bold normal-case">{getLevelTitle(level)}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {AVATAR_OPTIONS.map((option) => {
          const isUnlocked = level >= option.levelRequired;
          const isSelected = starryAvatar === option.emoji;

          return (
            <div
              key={option.emoji}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                isSelected ? 'bg-sky-100 ring-2 ring-sky-500 transform scale-105 shadow-md' :
                !isUnlocked ? 'bg-gray-100 opacity-75' :
                'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`mb-1 ${!isUnlocked ? 'grayscale opacity-50' : ''}`}>
                <StarryAvatarDisplay
                  avatar={option.emoji}
                  size="text-4xl"
                  isFloating={isSelected}
                  isExcited={false}
                />
              </div>
              <span className="text-xs font-bold text-gray-600">{option.name}</span>
              {!isUnlocked && (
                <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md bg-indigo-500 text-white">
                  L{option.levelRequired}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Prostredie</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {BACKGROUND_OPTIONS.map(bg => {
          const isUnlocked = unlockedBackgrounds.includes(bg.id);
          const isSelected = appBackground.id === bg.id;
          const canAfford = gems >= bg.price;

          return (
            <button
              key={bg.id}
              onClick={() => {
                if (isUnlocked) {
                  setAppBackground(bg);
                } else if (purchaseBackground(bg)) {
                  setAppBackground(bg);
                }
              }}
              className={`relative rounded-xl overflow-hidden h-20 group transition-all duration-300 ${
                isSelected ?
                  'ring-4 ring-sky-500 ring-offset-2 shadow-lg scale-[1.02]' :
                !isUnlocked ?
                  'opacity-60 grayscale' :
                  'hover:opacity-90 shadow-sm'
              }`}
            >
              <div className={`absolute inset-0 ${bg.className}`} />
              <span className={`relative z-10 text-sm font-bold block mt-1 ${bg.id === 'sky' ? 'text-gray-800' : 'text-white'} drop-shadow-md`}>{bg.name}</span>
              {!isUnlocked && (
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                  canAfford ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-400 text-white'
                }`}>
                  💎{bg.price}
                </div>
              )}
              {isSelected && isUnlocked && (
                <div className="absolute top-2 right-2 bg-sky-500 text-white rounded-full p-1 shadow-md animate-pop-in">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase flex items-center gap-2">
              🎤 Hlasový režim
            </div>
            <div className="text-sm font-medium text-emerald-900 mt-0.5">
              {voiceMode.isSupported ? 'Diktovanie a čítanie' : 'Nepodporované'}
            </div>
          </div>
          {voiceMode.isSupported && (
            <button
              onClick={() => voiceMode.toggleVoiceMode(!voiceMode.isEnabled)}
              className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                voiceMode.isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
              aria-label={voiceMode.isEnabled ? "Vypnúť hlasový režim" : "Zapnúť hlasový režim"}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  voiceMode.isEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-emerald-700/70">
          {voiceMode.isSupported
            ? 'Hovor do mikrofónu a Starlink ti bude odpovedať nahlas.'
            : 'Tvoj prehliadač nepodporuje hlasové funkcie.'}
        </p>
      </div>

      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
        <div className="text-xs font-bold tracking-wider text-indigo-700 uppercase flex items-center gap-2 mb-3">
          ✨ Mascot režim
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMascotMode('image')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mascotMode === 'image'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/60 text-indigo-700 hover:bg-white'
            }`}
          >
            🖼️ Statický
          </button>
          <button
            onClick={() => setMascotMode('spline3d')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mascotMode === 'spline3d'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/60 text-indigo-700 hover:bg-white'
            }`}
            title="Načíta ~4MB extra"
          >
            🌐 3D Premium
          </button>
        </div>
        <p className="mt-2 text-xs text-indigo-700/70">
          {mascotMode === 'spline3d'
            ? '3D režim stiahne extra 4MB pri zapnutí (premium funkcia).'
            : 'Najrýchlejší režim - statický obrázok.'}
        </p>
      </div>

      <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mt-6">Vlastný API Kľúč (Voliteľné)</div>
      <div className="mb-4">
        <input
          type="password"
          value={customApiKey}
          onChange={(e) => setCustomApiKey(e.target.value)}
          placeholder="Vložte Gemini API Key..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <p className="text-[10px] text-gray-400 mt-1 ml-1">Ak ostane prázdne, použije sa predvolený kľúč.</p>
      </div>

      <button onClick={onSaveCustomization} className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95">
        Uložiť zmeny
      </button>

      <div className="mt-8 pt-6 border-t border-red-100">
        <div className="mb-2 text-xs font-semibold text-red-400 uppercase tracking-wider ml-1">Nebezpečná zóna</div>
        <button
          onClick={onOpenDeleteConfirm}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"
        >
          <span>🗑️</span> Vymazať všetky dáta
        </button>
        <p className="text-[10px] text-red-400 mt-1 ml-1 text-center">Vymaže chat, profil, nastavenia a súhlas.</p>
      </div>
    </div>
  </div>
);

const DeleteConfirmModal: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-red-500 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span>⚠️</span> Vymazať všetko?
        </h3>
      </div>
      <div className="p-5">
        <p className="text-gray-700 mb-4">
          Naozaj vymazať všetky dáta? <strong>Táto akcia sa nedá vrátiť.</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Bude vymazaný chat, profil, nastavenia a rodičovský súhlas.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-gray-600 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Zrušiť
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Vymazať
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const StarlinkHeartModals: React.FC<StarlinkHeartModalsProps> = (props) => (
  <>
    {props.showParentNotice && (
      <ParentNotice onAccept={props.onConsentAccept} onCancel={props.onConsentCancel} />
    )}

    {props.activeParentGuide && (
      <ParentGuideModal activeParentGuide={props.activeParentGuide} onClose={props.onCloseParentGuide} />
    )}

    <CameraModal
      isOpen={props.showCameraModal}
      onClose={props.onCloseCameraModal}
      onPhotoTaken={props.onPhotoTaken}
    />

    {props.showProfileModal && (
      <ProfileModal
        onClose={props.onCloseProfileModal}
        starryAvatar={props.starryAvatar}
        gemJustEarned={props.gemJustEarned}
        gems={props.gems}
      />
    )}

    {props.showTipModal && (
      <TipModal
        onClose={props.onCloseTipModal}
        isTipLoading={props.isTipLoading}
        starryTip={props.starryTip}
      />
    )}

    {props.showCustomizeModal && (
      <CustomizationModal
        onClose={props.onCloseCustomizeModal}
        customApiKey={props.customApiKey}
        setCustomApiKey={props.setCustomApiKey}
        appBackground={props.appBackground}
        setAppBackground={props.setAppBackground}
        unlockedBackgrounds={props.unlockedBackgrounds}
        purchaseBackground={props.purchaseBackground}
        level={props.level}
        gems={props.gems}
        starryAvatar={props.starryAvatar}
        voiceMode={props.voiceMode}
        mascotMode={props.mascotMode}
        setMascotMode={props.setMascotMode}
        onSaveCustomization={props.onSaveCustomization}
        onOpenDeleteConfirm={props.onOpenDeleteConfirm}
      />
    )}

    {props.showDeleteConfirm && (
      <DeleteConfirmModal onCancel={props.onCloseDeleteConfirm} onConfirm={props.onConfirmDelete} />
    )}
  </>
);
