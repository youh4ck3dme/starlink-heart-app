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
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
             <div className="text-center text-white/50 py-10">Načítavam dáta...</div>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-xl border ${
                   entry.id === userEntry?.id 
                     ? 'bg-blue-500/20 border-blue-500/50' 
                     : 'bg-white/5 border-white/5'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center font-black text-lg ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' : 'text-white/30'
                }`}>
                    {index + 1}
                </div>
                
                <div className="text-3xl">{entry.avatar}</div>
                
                <div className="flex-1">
                    <h4 className={`font-bold ${entry.id === userEntry?.id ? 'text-blue-300' : 'text-white'}`}>
                        {entry.nickname}
                    </h4>
                    <div className="flex items-center gap-2">
                        {entry.badges.map(b => (
                            <span key={b} className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-200 rounded border border-yellow-500/30">
                                {b}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="text-right">
                    <div className="font-black text-white text-lg">{entry.score}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Bodov</div>
                </div>
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
