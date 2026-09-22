import React from 'react';
import { motion } from 'framer-motion';
import { useLeaderboard } from '../../features/gamification/hooks/useLeaderboard';
import { LeaderboardEntry } from '../../features/gamification/services/LeaderboardService';

interface Props {
  onShowFull: () => void;
}

export const LeaderboardWidget: React.FC<Props> = ({ onShowFull }) => {
  const { leaderboard, loading } = useLeaderboard('class'); // Default to class view for dashboard
  const top3 = leaderboard.slice(0, 3);

  if (loading) return <div className="h-40 animate-pulse bg-white/5 rounded-2xl" />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 mt-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span>🏆</span> Hviezdni Žiaci
        </h3>
        <button 
          onClick={onShowFull}
          className="text-xs text-blue-300 hover:text-blue-200 font-medium"
        >
          Zobraziť všetkých
        </button>
      </div>

      <div className="flex justify-center items-end gap-2 mb-2">
        {/* 2nd Place */}
        <PodiumEntry entry={top3[1]} place={2} />
        {/* 1st Place */}
        <PodiumEntry entry={top3[0]} place={1} />
        {/* 3rd Place */}
        <PodiumEntry entry={top3[2]} place={3} />
      </div>
    </motion.div>
  );
};

const PodiumEntry = ({ entry, place }: { entry?: LeaderboardEntry, place: number }) => {
  if (!entry) return null;

  const height = place === 1 ? 'h-24' : place === 2 ? 'h-16' : 'h-12';
  const color = place === 1 ? 'bg-yellow-500' : place === 2 ? 'bg-gray-400' : 'bg-orange-600';
  const scale = place === 1 ? 1.1 : 1;

  return (
    <div className={`flex flex-col items-center gap-2 transform scale-${scale * 100}`}>
      <div className="relative">
        <span className="text-2xl">{entry.avatar}</span>
        <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/20 ${color}`}>
            {place}
        </div>
      </div>
      <div className="text-xs text-white/80 font-medium truncate max-w-[60px]">{entry.nickname}</div>
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        className={`w-14 ${height} ${color} rounded-t-lg opacity-80 backdrop-blur-sm border-t border-white/20`}
      />
    </div>
  );
};
