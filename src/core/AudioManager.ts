import { gameConfig } from '../data/gameConfig';

type SoundId = 'portalEnter' | 'walk' | 'jump' | 'backgroundMusic';

export class AudioManager {
  private sounds: Partial<Record<SoundId, HTMLAudioElement>> = {};
  private walkVariants: HTMLAudioElement[] = [];
  private lastWalkVariantIndex: number = -1;

  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isUnlocked: boolean = false;

  private walkIntervalId: number | null = null;
  private synthMusicNodes: OscillatorNode[] = [];
  private synthMusicGain: GainNode | null = null;
  private backgroundMusicRequested: boolean = false;

  constructor() {
    this.loadSound('portalEnter');
    this.loadSound('walk');
    this.loadSound('jump');
    this.loadSound('backgroundMusic');
    this.loadWalkVariants();
    this.registerUnlockListeners();
  }

  private loadWalkVariants(): void {
    const variants = gameConfig.audio.walk.variants ?? [];
    if (variants.length === 0) {
      return;
    }

    this.walkVariants = variants.map((src) => {
      const audio = new Audio(src);
      audio.volume = gameConfig.audio.walk.volume;
      audio.loop = false;
      return audio;
    });
  }

  private registerUnlockListeners(): void {
    const unlock = () => {
      this.unlockAudio();
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  private unlockAudio(): void {
    if (this.isUnlocked) {
      return;
    }

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.6;
    this.masterGain.connect(this.audioContext.destination);
    this.isUnlocked = true;

    if (this.backgroundMusicRequested) {
      this.setBackgroundMusicActive(true);
    }
  }

  private loadSound(soundId: SoundId): void {
    const config = gameConfig.audio[soundId];
    if (!config?.src) {
      return;
    }

    const audio = new Audio(config.src);
    audio.volume = config.volume;
    audio.loop = config.loop ?? false;
    this.sounds[soundId] = audio;
  }

  private playSynthTone(frequency: number, durationSeconds: number, volume: number, type: OscillatorType): void {
    if (!this.audioContext || !this.masterGain) {
      return;
    }

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.audioContext.currentTime;
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    osc.start(now);
    osc.stop(now + durationSeconds);
  }

  play(soundId: Exclude<SoundId, 'backgroundMusic'>): void {
    const sound = this.sounds[soundId];
    if (sound) {
      if (!sound.loop) {
        sound.currentTime = 0;
      }
      void sound.play().catch(() => {
        // Ignore autoplay/runtime audio errors.
      });
      return;
    }

    if (!this.isUnlocked) {
      return;
    }

    if (soundId === 'portalEnter') {
      this.playSynthTone(760, 0.08, 0.14, 'triangle');
      this.playSynthTone(1020, 0.12, 0.1, 'sine');
      return;
    }

    if (soundId === 'jump') {
      this.playSynthTone(420, 0.06, 0.15, 'square');
      this.playSynthTone(620, 0.1, 0.1, 'triangle');
    }
  }

  stop(soundId: SoundId): void {
    const sound = this.sounds[soundId];
    if (!sound) {
      return;
    }

    sound.pause();
    if (!sound.loop) {
      sound.currentTime = 0;
    }
  }

  setWalkingActive(active: boolean): void {
    if (this.walkVariants.length > 0) {
      if (active) {
        if (this.walkIntervalId === null) {
          this.playRandomWalkVariant();
          this.walkIntervalId = window.setInterval(() => {
            this.playRandomWalkVariant();
          }, 165);
        }
      } else if (this.walkIntervalId !== null) {
        window.clearInterval(this.walkIntervalId);
        this.walkIntervalId = null;
      }
      return;
    }

    const walk = this.sounds.walk;
    if (walk) {
      if (active) {
        if (walk.paused) {
          void walk.play().catch(() => {
            // Ignore autoplay/runtime audio errors.
          });
        }
      } else {
        walk.pause();
        walk.currentTime = 0;
      }
      return;
    }

    if (!this.isUnlocked) {
      return;
    }

    if (active) {
      if (this.walkIntervalId === null) {
        this.walkIntervalId = window.setInterval(() => {
          this.playSynthTone(180, 0.04, 0.08, 'square');
        }, 180);
      }
      return;
    }

    if (this.walkIntervalId !== null) {
      window.clearInterval(this.walkIntervalId);
      this.walkIntervalId = null;
    }
  }

  private playRandomWalkVariant(): void {
    if (this.walkVariants.length === 0) {
      return;
    }

    let index = Math.floor(Math.random() * this.walkVariants.length);
    if (this.walkVariants.length > 1 && index === this.lastWalkVariantIndex) {
      index = (index + 1) % this.walkVariants.length;
    }
    this.lastWalkVariantIndex = index;

    const sample = this.walkVariants[index];
    const instance = sample.cloneNode(true) as HTMLAudioElement;
    instance.volume = sample.volume;
    void instance.play().catch(() => {
      // Ignore autoplay/runtime audio errors.
    });
  }

  setBackgroundMusicActive(active: boolean): void {
    this.backgroundMusicRequested = active;

    const bg = this.sounds.backgroundMusic;
    if (bg) {
      if (active) {
        void bg.play().catch(() => {
          // Ignore autoplay/runtime audio errors.
        });
      } else {
        bg.pause();
      }
      return;
    }

    if (!this.isUnlocked || !this.audioContext || !this.masterGain) {
      return;
    }

    if (active) {
      if (this.synthMusicNodes.length > 0) {
        return;
      }

      const gain = this.audioContext.createGain();
      gain.gain.value = 0.03;
      gain.connect(this.masterGain);

      const osc1 = this.audioContext.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 196;
      osc1.connect(gain);

      const osc2 = this.audioContext.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 246.94;
      osc2.connect(gain);

      osc1.start();
      osc2.start();

      this.synthMusicGain = gain;
      this.synthMusicNodes = [osc1, osc2];
      return;
    }

    this.stopBackgroundMusic();
  }

  private stopBackgroundMusic(): void {
    const bg = this.sounds.backgroundMusic;
    if (bg) {
      bg.pause();
      bg.currentTime = 0;
    }

    for (const node of this.synthMusicNodes) {
      node.stop();
    }
    this.synthMusicNodes = [];

    if (this.synthMusicGain) {
      this.synthMusicGain.disconnect();
      this.synthMusicGain = null;
    }
  }
}
