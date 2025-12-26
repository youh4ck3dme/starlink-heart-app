import { Howl } from 'howler';

// Map of sound keys to their file paths (assumes assets exist)
const SOUND_ASSETS = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  levelUp: '/sounds/levelup.mp3',
  bgm: '/sounds/space-ambient.mp3',
};

type SoundKey = keyof typeof SOUND_ASSETS;

class SoundManager {
  private sounds: Record<string, Howl> = {};
  private muted: boolean = false;

  constructor() {
    this.muted = localStorage.getItem('soundMuted') === 'true';
  }

  preload() {
    Object.entries(SOUND_ASSETS).forEach(([key, src]) => {
      this.sounds[key] = new Howl({
        src: [src],
        preload: true,
        volume: key === 'bgm' ? 0.3 : 0.6,
        loop: key === 'bgm',
        onloaderror: (_id, err) => {
           console.warn(`Failed to load sound ${key}:`, err);
        }
      });
    });
  }

  play(key: SoundKey) {
    if (this.muted) return;
    
    if (!this.sounds[key]) {
        // Lazy load attempt if not preloaded (or just retry)
        this.sounds[key] = new Howl({ src: [SOUND_ASSETS[key]] });
    }

    this.sounds[key].play();
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('soundMuted', String(this.muted));
    Howler.mute(this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }
}

export const soundManager = new SoundManager();

// Simple hook for components
export const playSound = (key: SoundKey) => soundManager.play(key);
