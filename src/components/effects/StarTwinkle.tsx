import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export function StarTwinkle({ className='' }: { className?: string }) {
  // Tsparticles engine init
  const init = async (engine: any) => { await loadFull(engine); };
  return (
    <Particles
      id="twinkle"
      init={init}
      className={className}
      options={{
        fullScreen: { enable: false },
        fpsLimit: 60,
        background: { color: 'transparent' },
        particles: {
          number: { value: 40, density: { enable: true, value_area: 800 } },
          size: { value: { min: 0.5, max: 1.8 } },
          move: { enable: true, speed: 0.2 },
          opacity: { value: { min: 0.4, max: 0.9 }, animation: { enable: true, speed: 0.4 } },
          color: { value: ['#fff', '#aee3ff', '#d6b3ff'] }
        },
        detectRetina: true
      }}
    />
  );
}
