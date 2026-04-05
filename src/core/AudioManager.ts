import { gameConfig } from '../data/gameConfig';

type SoundId = 'portalEnter' | 'walk' | 'jump';

export class AudioManager {
  private sounds: Partial<Record<SoundId, HTMLAudioElement>> = {};

  constructor() {
    this.loadSound('portalEnter');
    this.loadSound('walk');
    this.loadSound('jump');
  }

  private loadSound(soundId: SoundId): void {
    const config = gameConfig.audio[soundId];
    if (!config.src) {
      return;
    }

    const audio = new Audio(config.src);
    audio.volume = config.volume;
    audio.loop = config.loop ?? false;
    this.sounds[soundId] = audio;
  }

  play(soundId: SoundId): void {
    const sound = this.sounds[soundId];
    if (!sound) {
      return;
    }

    if (!sound.loop) {
      sound.currentTime = 0;
    }

    void sound.play().catch(() => {
      // Ignore autoplay/runtime audio errors in browsers with stricter policies.
    });
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
    const walk = this.sounds.walk;
    if (!walk) {
      return;
    }

    if (active) {
      if (walk.paused) {
        void walk.play().catch(() => {
          // Ignore autoplay/runtime audio errors in browsers with stricter policies.
        });
      }
      return;
    }

    walk.pause();
    walk.currentTime = 0;
  }
}
