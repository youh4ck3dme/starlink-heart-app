import React from 'react';
import { motion } from 'framer-motion';

type Node = {
  id: string;
  label: string;
  x: number; // percent (0..100)
  y: number; // percent (0..100)
  guard: 'Robo' | 'Comet' | 'Starry';
  range: string; // "1–10" etc.
};

const NODES: Node[] = [
  { id: 'iron', label: 'Železná Hmlovina', x: 35, y: 20, guard: 'Robo', range: '1–10' },
  { id: 'comet', label: 'Ľadový Chvost Kométy', x: 60, y: 55, guard: 'Comet', range: '11–20' },
  { id: 'core', label: 'Hviezdne Jadro', x: 45, y: 85, guard: 'Starry', range: '21–30' },
];

interface Props {
  onEnter?: (id: string) => void;
}

export default function GalaxyRoadmap({ onEnter }: Props) {
  return (
    <div className="relative h-[160vh] w-full select-none">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d="M20,10 C40,20 60,0 70,20 S80,60 55,70 40,90 45,95"
          fill="none"
          stroke="url(#glow)"
          strokeWidth={1.6}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ amount: 0.2, once: true }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>

      {NODES.map((n, i) => (
        <motion.button
          key={n.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
          onClick={() => onEnter?.(n.id)}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: i * 0.15 }}
          aria-label={`${n.label} – levely ${n.range}`}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-300 to-violet-400 shadow-[0_0_30px_rgba(99,102,241,0.6)]" />
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 text-white/90 text-sm text-center whitespace-nowrap">
              {n.label} <span className="opacity-70">({n.range})</span>
            </span>
          </motion.div>
        </motion.button>
      ))}
    </div>
  );
}
