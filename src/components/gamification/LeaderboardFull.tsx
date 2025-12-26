import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from '../../features/gamification/hooks/useLeaderboard';
import { LeaderboardScope } from '../../features/gamification/services/LeaderboardService';

interface Props {
  onClose: () => void;
}

export const LeaderboardFull: React.FC<Props> = ({ onClose }) => {
  const [scope, setScope] = useState<LeaderboardScope>('class');
  const { leaderboard, userEntry, loading } = useLeaderboard(scope);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
    >
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
              Galaktický Rebríček
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          {/* Scope Selector */}
          <div className="flex p-1 bg-black/30 rounded-xl">
            {(['class', 'school', 'global'] as LeaderboardScope[]).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  scope === s 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {s === 'class' ? 'Trieda' : s === 'school' ? 'Škola' : 'Svet'}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-8 h-8 border-2 border-t-blue-500 rounded-full animate-spin mb-4"/>
                <span className="text-sm font-medium tracking-wide">Načítavam dáta...</span>
             </div>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 group ${
                   entry.id === userEntry?.id 
                     ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                     : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                {/* Rank Indicator */}
                <div className={`w-10 h-10 flex items-center justify-center font-black text-xl rounded-full ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-black shadow-lg shadow-amber-500/20' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-slate-500 text-black shadow-lg shadow-slate-500/20' :
                    index === 2 ? 'bg-gradient-to-br from-orange-300 to-red-500 text-black shadow-lg shadow-orange-500/20' : 
                    'text-white/30 bg-white/5'
                }`}>
                    {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                
                <div className="text-3xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{entry.avatar}</div>
                
                <div className="flex-1 min-w-0">
                    <h4 className={`font-bold truncate ${entry.id === userEntry?.id ? 'text-blue-200' : 'text-white group-hover:text-blue-200 transition-colors'}`}>
                        {entry.nickname}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {entry.badges.slice(0, 3).map(b => (
                            <span key={b} className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-200 rounded-md border border-yellow-500/20 backdrop-blur-sm">
                                {b}
                            </span>
                        ))}
                        {entry.badges.length > 3 && (
                            <span className="text-[9px] text-white/30">+{entry.badges.length - 3}</span>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="font-black text-white text-lg tracking-tight tabular-nums group-hover:text-blue-300 transition-colors">
                        {entry.score}
                    </div>
                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">XP</div>
                </div>

                {/* Shimmer Effect for User */}
                {entry.id === userEntry?.id && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]"/>
                    </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* User Footer (Current User) */}
        {userEntry && (
            <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-sm text-white/60 mb-1">
                    <span>Tvoja pozícia:</span>
                    <span className="text-white font-bold">#{userEntry.rank}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/60">
                    <span>Na ďalšiu priečku:</span>
                    <span className="text-blue-400 font-bold">120 bodov</span>
                </div>
            </div>
        )}

      </div>
    </motion.div>
  );
};
