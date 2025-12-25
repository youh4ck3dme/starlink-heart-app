interface VoiceRecordingModalProps {
  isListening: boolean;
  onCancel: () => void;
}

export default function VoiceRecordingModal({ isListening, onCancel }: VoiceRecordingModalProps) {
  if (!isListening) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-scale-in border border-white/20">
        
        {/* Microphone Icon with Pulse */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Pulsing circles */}
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse" />
            
            {/* Mic icon */}
            <div className="relative bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Počúvam...
          </h3>
          <p className="text-gray-600 text-sm">
            Hovor do mikrofónu. Som tu!
          </p>
        </div>

        {/* Waveform Animation */}
        <div className="flex items-center justify-center gap-1 mb-8 h-12">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-red-500 to-red-400 rounded-full animate-wave"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: '100%',
              }}
            />
          ))}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors active:scale-95"
        >
          Zrušiť
        </button>

        {/* Hint */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Automaticky sa ukončí po dokončení vety
        </p>
      </div>
    </div>
  );
}
