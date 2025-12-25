export type BackgroundOption = {
  id: string;
  name: string;
  className: string;
  textColor: string;
  accent: string;
  glass: string;
};

export const STARRY_BACKGROUND_KEY = 'starryBackground';

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'sky',
    name: 'Svetlá obloha',
    className: 'bg-sky-50',
    textColor: 'text-gray-800',
    accent: 'bg-sky-500',
    glass: 'bg-white/70',
  },
  {
    id: 'space',
    name: 'Hlboký vesmír',
    className: 'bg-deep-space',
    textColor: 'text-gray-100',
    accent: 'bg-indigo-500',
    glass: 'bg-slate-900/60',
  },
  {
    id: 'mars',
    name: 'Západ na Marse',
    className: 'bg-mars-sunset',
    textColor: 'text-white',
    accent: 'bg-orange-600',
    glass: 'bg-orange-900/40',
  },
  {
    id: 'galaxy',
    name: 'Galaktický vír',
    className: 'bg-galaxy-swirl',
    textColor: 'text-white',
    accent: 'bg-fuchsia-500',
    glass: 'bg-purple-900/40',
  },
];

export const DEFAULT_BACKGROUND = BACKGROUND_OPTIONS[0];
