import { useRegisterSW } from 'virtual:pwa-register/react';
import { useHaptics } from '../../hooks/useHaptics';

export default function PWANotification() {
  const haptics = useHaptics();
  
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    haptics.mediumTap();
    updateServiceWorker(true);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4 animate-fade-in-up">
      <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 text-white px-5 py-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 max-w-md w-full">
        <div className="flex-1">
          {offlineReady ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-sm">Pripravené na offline</p>
                <p className="text-xs text-slate-300">Apka teraz funguje aj bez internetu!</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🚀</span>
              <div>
                <p className="font-bold text-sm">Nová verzia dostupná</p>
                <p className="text-xs text-slate-300">Klikni na tlačidlo pre aktualizáciu.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {needRefresh && (
            <button
              onClick={handleUpdate}
              className="flex-1 sm:flex-none bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg"
            >
              Aktualizovať
            </button>
          )}
          <button
            onClick={close}
            className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
