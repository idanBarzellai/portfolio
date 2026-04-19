import { PlatformData } from '../entities/Platform';
export type SceneId = 'main' | 'about' | 'projects' | 'work-experience' | 'academic-experience' | 'languages' | 'skills';
export interface RopeConfig {
    x: number;
    y: number;
    height: number;
    width?: number;
}
export interface SceneVisualConfig {
    roomTitle: string;
    roomSubtitle: string;
    backgroundImage?: string;
    backgroundGradient: [string, string];
}
export interface PlayerSpriteStateConfig {
    src?: string;
    frameSources?: string[];
    frameWidth: number;
    frameHeight: number;
    frames: number;
    fps: number;
}
export interface SoundClipConfig {
    src?: string;
    variants?: string[];
    volume: number;
    loop?: boolean;
}
export interface GameConfig {
    canvas: {
        width: number;
        height: number;
    };
    mainScene: {
        spawn: {
            x: number;
            y: number;
        };
        platforms: PlatformData[];
        ropes: RopeConfig[];
    };
    sectionScene: {
        spawn: {
            x: number;
            y: number;
        };
    };
    player: {
        width: number;
        height: number;
        sprites: {
            idle: PlayerSpriteStateConfig;
            walk: PlayerSpriteStateConfig;
            jump: PlayerSpriteStateConfig;
            climb: PlayerSpriteStateConfig;
        };
    };
    audio: {
        portalEnter: SoundClipConfig;
        walk: SoundClipConfig;
        jump: SoundClipConfig;
        backgroundMusic: SoundClipConfig;
    };
    scenes: Record<SceneId, SceneVisualConfig>;
}
export declare const gameConfig: GameConfig;
//# sourceMappingURL=gameConfig.d.ts.map