import React from 'react';

interface Props {
  size?: number; // px
  stroke?: number; // px
  progress: number; // 0..1
  children?: React.ReactNode;
}

export default function ProgressRing({ size = 64, stroke = 6, progress, children }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, progress)) * c;
  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.2)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#g)" strokeWidth={stroke} fill="none" strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-white font-semibold">{children}</div>
    </div>
  );
}
