import { PlatformData } from '../entities/Platform';

export type SceneId =
  | 'main'
  | 'projects'
  | 'work-experience'
  | 'academic-experience'
  | 'languages'
  | 'skills';

export interface RopeConfig {
  x: number;
  y: number;
  height: number;
}

export interface SceneVisualConfig {
  roomTitle: string;
  roomSubtitle: string;
  backgroundImage?: string;
  backgroundGradient: [string, string];
}

export interface PlayerSpriteStateConfig {
  src?: string;
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

export const gameConfig: GameConfig = {
  canvas: {
    width: 1200,
    height: 700,
  },
  mainScene: {
    spawn: {
      x: 110,
      y: 520,
    },
    platforms: [
      {
        id: 'ground',
        x: 0,
        y: 600,
        width: 1200,
        height: 100,
        color: '#228B22',
      },
      {
        id: 'platform-skills',
        x: 100,
        y: 480,
        width: 200,
        height: 40,
        section: 'Skills',
        sectionId: 'skills',
        color: '#4169E1',
      },
      {
        id: 'platform-projects',
        x: 500,
        y: 350,
        width: 200,
        height: 40,
        section: 'Projects',
        sectionId: 'projects',
        color: '#FF8C00',
      },
      {
        id: 'platform-languages',
        x: 900,
        y: 480,
        width: 200,
        height: 40,
        section: 'Languages',
        sectionId: 'languages',
        color: '#DC143C',
      },
      {
        id: 'platform-work',
        x: 300,
        y: 200,
        width: 200,
        height: 40,
        section: 'Work Experience',
        sectionId: 'work-experience',
        color: '#9370DB',
      },
      {
        id: 'platform-academic',
        x: 760,
        y: 220,
        width: 220,
        height: 40,
        section: 'Academic Experience',
        sectionId: 'academic-experience',
        color: '#2E8B57',
      },
    ],
    ropes: [
      { x: 320, y: 160, height: 240 },
      { x: 620, y: 300, height: 240 },
      { x: 860, y: 180, height: 320 },
    ],
  },
  sectionScene: {
    spawn: {
      x: 150,
      y: 520,
    },
  },
  player: {
    width: 42,
    height: 52,
    sprites: {
      // Replace src paths with your own sprite sheets under dist/assets/...
      idle: { src: undefined, frameWidth: 42, frameHeight: 52, frames: 4, fps: 6 },
      walk: { src: undefined, frameWidth: 42, frameHeight: 52, frames: 6, fps: 10 },
      jump: { src: undefined, frameWidth: 42, frameHeight: 52, frames: 2, fps: 4 },
      climb: { src: undefined, frameWidth: 42, frameHeight: 52, frames: 4, fps: 8 },
    },
  },
  audio: {
    // Replace src paths with your own files under dist/assets/sfx/...
    portalEnter: { src: undefined, volume: 0.65 },
    walk: {
      src: undefined,
      variants: [
        'assets/Floor/Steps_floor-001.ogg',
        'assets/Floor/Steps_floor-002.ogg',
        'assets/Floor/Steps_floor-003.ogg',
        'assets/Floor/Steps_floor-004.ogg',
        'assets/Floor/Steps_floor-005.ogg',
        'assets/Floor/Steps_floor-006.ogg',
        'assets/Floor/Steps_floor-007.ogg',
        'assets/Floor/Steps_floor-008.ogg',
        'assets/Floor/Steps_floor-009.ogg',
        'assets/Floor/Steps_floor-010.ogg',
        'assets/Floor/Steps_floor-011.ogg',
        'assets/Floor/Steps_floor-012.ogg',
        'assets/Floor/Steps_floor-013.ogg',
        'assets/Floor/Steps_floor-014.ogg',
        'assets/Floor/Steps_floor-015.ogg',
        'assets/Floor/Steps_floor-016.ogg',
        'assets/Floor/Steps_floor-017.ogg',
        'assets/Floor/Steps_floor-018.ogg',
        'assets/Floor/Steps_floor-019.ogg',
        'assets/Floor/Steps_floor-020.ogg',
        'assets/Floor/Steps_floor-021.ogg',
      ],
      volume: 0.35,
      loop: true,
    },
    jump: { src: 'assets/jump.wav', volume: 0.75 },
    backgroundMusic: { src: 'assets/BGM.mp3', volume: 0.22, loop: true },
  },
  scenes: {
    main: {
      roomTitle: 'Main World',
      roomSubtitle: 'Choose a portal and press Up to enter.',
      backgroundGradient: ['#87CEEB', '#E0F6FF'],
      backgroundImage: undefined,
    },
    projects: {
      roomTitle: 'Projects Gallery',
      roomSubtitle: 'Featured games and prototypes.',
      backgroundGradient: ['#27213C', '#3B2F63'],
      backgroundImage: undefined,
    },
    'work-experience': {
      roomTitle: 'Factory of Experience',
      roomSubtitle: 'Workplaces represented as assembly stations.',
      backgroundGradient: ['#4A4E69', '#22223B'],
      backgroundImage: undefined,
    },
    'academic-experience': {
      roomTitle: 'Academic Library',
      roomSubtitle: 'References and study milestones.',
      backgroundGradient: ['#A8DADC', '#457B9D'],
      backgroundImage: undefined,
    },
    languages: {
      roomTitle: 'Language Hangar',
      roomSubtitle: 'Programming languages around an aircraft scene.',
      backgroundGradient: ['#90E0EF', '#0077B6'],
      backgroundImage: undefined,
    },
    skills: {
      roomTitle: 'Blacksmith Workshop',
      roomSubtitle: 'Each weapon is a core skill.',
      backgroundGradient: ['#5A3F37', '#2C1E1A'],
      backgroundImage: undefined,
    },
  },
};
