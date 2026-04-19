type SoundId = 'portalEnter' | 'walk' | 'jump' | 'backgroundMusic';
export declare class AudioManager {
    private sounds;
    private walkVariants;
    private lastWalkVariantIndex;
    private audioContext;
    private masterGain;
    private isUnlocked;
    private walkIntervalId;
    private synthMusicNodes;
    private synthMusicGain;
    private backgroundMusicRequested;
    constructor();
    private loadWalkVariants;
    private registerUnlockListeners;
    private unlockAudio;
    private loadSound;
    private playSynthTone;
    play(soundId: Exclude<SoundId, 'backgroundMusic'>): void;
    stop(soundId: SoundId): void;
    setWalkingActive(active: boolean): void;
    private playRandomWalkVariant;
    setBackgroundMusicActive(active: boolean): void;
    private stopBackgroundMusic;
}
export {};
//# sourceMappingURL=AudioManager.d.ts.map