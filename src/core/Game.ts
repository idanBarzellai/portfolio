/**
 * Main Game Class
 * Handles the game loop, rendering, and update logic.
 */

import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { Rope } from '../entities/Rope';
import { Portal } from '../entities/Portal';
import { Input } from './Input';
import { Physics } from './Physics';
import { AudioManager } from './AudioManager';
import { gameConfig, SceneId } from '../data/gameConfig';
import { hydratePortfolioSectionsFromAssets, portfolioSections, ProjectData, SectionData } from '../data/portfolioData';

interface ProjectHitArea {
  x: number;
  y: number;
  width: number;
  height: number;
  project: ProjectData;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: Input;
  private player: Player;
  private audio: AudioManager;

  private platforms: Platform[] = [];
  private ropes: Rope[] = [];
  private portals: Portal[] = [];

  private animationFrameId: number | null = null;
  private wasInteractPressed: boolean = false;
  private activePortalHint: Portal | null = null;
  private currentScene: SceneId = 'main';

  private imageCache: Map<string, HTMLImageElement> = new Map();
  private projectHitAreas: ProjectHitArea[] = [];
  private cameraX = 0;

  private debugPosition: HTMLElement | null = null;
  private debugVelocity: HTMLElement | null = null;
  private debugGrounded: HTMLElement | null = null;
  private debugLadder: HTMLElement | null = null;
  private debugScene: HTMLElement | null = null;
  private jumpSlider: HTMLInputElement | null = null;
  private moveSlider: HTMLInputElement | null = null;
  private climbSlider: HTMLInputElement | null = null;
  private jumpValue: HTMLElement | null = null;
  private moveValue: HTMLElement | null = null;
  private climbValue: HTMLElement | null = null;

  private wasGroundedLastFrame: boolean = false;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.syncCanvasSize();
    window.addEventListener('resize', () => this.syncCanvasSize());

    this.input = new Input();
    this.player = new Player(100, 200);
    this.audio = new AudioManager();

    this.initializeUI();
    this.initializePointerInteraction();
    this.audio.setBackgroundMusicActive(true);
    this.initializeScene('main');
    hydratePortfolioSectionsFromAssets().catch(() => {
      // Keep default fallback content if text assets are unavailable.
    });
    this.start();
  }

  private initializePointerInteraction(): void {
    this.canvas.addEventListener('mousemove', (event) => {
      if (this.currentScene !== 'projects') {
        this.canvas.style.cursor = 'default';
        return;
      }

      const { x, y } = this.getCanvasCoordinates(event);
      const hoveredProject = this.projectHitAreas.find((area) => this.isPointInArea(x + this.cameraX, y, area));
      this.canvas.style.cursor = hoveredProject ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', (event) => {
      if (this.currentScene !== 'projects') {
        return;
      }

      const { x, y } = this.getCanvasCoordinates(event);
      const clickedProject = this.projectHitAreas.find((area) => this.isPointInArea(x + this.cameraX, y, area));
      if (!clickedProject) {
        return;
      }

      const targetProject = clickedProject.project;
      if (!targetProject.link) {
        window.alert(`No project link is configured yet for "${targetProject.title}".`);
        return;
      }

      const shouldOpen = window.confirm(`Would you like to open "${targetProject.title}" in a new tab?`);
      if (shouldOpen) {
        window.open(targetProject.link, '_blank', 'noopener,noreferrer');
      }
    });
  }

  private getCanvasCoordinates(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  private isPointInArea(x: number, y: number, area: ProjectHitArea): boolean {
    return x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height;
  }

  private syncCanvasSize(): void {
    const width = this.canvas.clientWidth || gameConfig.canvas.width;
    const height = this.canvas.clientHeight || gameConfig.canvas.height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private initializeUI(): void {
    this.debugPosition = document.getElementById('debug-position');
    this.debugVelocity = document.getElementById('debug-velocity');
    this.debugGrounded = document.getElementById('debug-grounded');
    this.debugLadder = document.getElementById('debug-ladder');
    this.debugScene = document.getElementById('debug-scene');

    this.jumpSlider = document.getElementById('slider-jump') as HTMLInputElement | null;
    this.moveSlider = document.getElementById('slider-move') as HTMLInputElement | null;
    this.climbSlider = document.getElementById('slider-climb') as HTMLInputElement | null;

    this.jumpValue = document.getElementById('slider-jump-value');
    this.moveValue = document.getElementById('slider-move-value');
    this.climbValue = document.getElementById('slider-climb-value');

    this.configureTuningSliders();
  }

  private configureTuningSliders(): void {
    const bindSlider = (
      slider: HTMLInputElement | null,
      valueNode: HTMLElement | null,
      initialValue: number,
      onValue: (value: number) => void
    ): void => {
      if (!slider) {
        return;
      }

      slider.value = initialValue.toString();
      if (valueNode) {
        valueNode.textContent = initialValue.toFixed(1);
      }

      const handler = () => {
        const parsed = Number(slider.value);
        onValue(parsed);
        if (valueNode) {
          valueNode.textContent = parsed.toFixed(1);
        }
      };

      slider.addEventListener('input', handler);
      handler();
    };

    bindSlider(this.jumpSlider, this.jumpValue, this.player.getJumpPower(), (value) => {
      this.player.setJumpPower(value);
    });

    bindSlider(this.moveSlider, this.moveValue, this.player.getMoveSpeed(), (value) => {
      this.player.setMoveSpeed(value);
    });

    bindSlider(this.climbSlider, this.climbValue, this.player.getClimbSpeed(), (value) => {
      this.player.setClimbSpeed(value);
    });
  }

  private initializeMainScene(): void {
    this.platforms = gameConfig.mainScene.platforms.map((platformData) => new Platform(platformData));
    this.ropes = gameConfig.mainScene.ropes.map((rope) => new Rope(rope.x, rope.y, rope.height, rope.width));

    this.portals = this.platforms
      .filter((platform) => !!platform.section && !!platform.sectionId)
      .map((platform) => {
        const portalX = platform.x + platform.width / 2 - 22;
        const portalY = platform.y - 66;
        return new Portal(portalX, portalY, platform.sectionId!, platform.section!);
      });

    this.player.x = gameConfig.mainScene.spawn.x;
    this.player.y = gameConfig.mainScene.spawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  private initializeSectionScene(_: Exclude<SceneId, 'main'>): void {
    const sceneWidth = this.getCurrentSceneWidth();

    this.platforms = [
      new Platform({
        id: 'section-ground',
        x: 0,
        y: 600,
        width: sceneWidth,
        height: 100,
        color: '#2F4F4F',
      }),
    ];

    this.ropes = [];
    this.portals = [new Portal(60, 520, 'main', 'Exit')];

    this.player.x = gameConfig.sectionScene.spawn.x;
    this.player.y = gameConfig.sectionScene.spawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  private getCurrentSceneWidth(): number {
    if (this.currentScene !== 'projects') {
      return this.canvas.width;
    }

    const section = this.getSection('projects');
    const projectCount = section?.projects?.length ?? 0;
    const imageWidth = 190;
    const gap = 34;
    const startX = 120;
    const totalWidth = startX * 2 + projectCount * imageWidth + Math.max(0, projectCount - 1) * gap;
    return Math.max(this.canvas.width, totalWidth);
  }

  private updateCamera(): void {
    const sceneWidth = this.getCurrentSceneWidth();
    const maxCamera = Math.max(0, sceneWidth - this.canvas.width);

    if (this.currentScene !== 'projects') {
      this.cameraX = 0;
      return;
    }

    const targetCamera = this.player.x + this.player.width / 2 - this.canvas.width / 2;
    const clampedTarget = Math.max(0, Math.min(maxCamera, targetCamera));
    this.cameraX += (clampedTarget - this.cameraX) * 0.14;
  }

  private initializeScene(sceneId: SceneId): void {
    this.currentScene = sceneId;
    this.cameraX = 0;
    this.activePortalHint = null;
    this.wasInteractPressed = false;

    if (sceneId === 'main') {
      this.initializeMainScene();
    } else {
      this.initializeSectionScene(sceneId);
    }
  }

  private getSection(sectionId: SceneId): SectionData | undefined {
    if (sectionId === 'main') {
      return undefined;
    }
    return portfolioSections.find((section) => section.id === sectionId);
  }

  private getImage(src?: string): HTMLImageElement | null {
    if (!src) {
      return null;
    }

    let image = this.imageCache.get(src);
    if (!image) {
      image = new Image();
      image.src = src;
      this.imageCache.set(src, image);
    }

    if (!image.complete || image.naturalWidth === 0) {
      return null;
    }

    return image;
  }

  private drawImageCover(image: HTMLImageElement): void {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const scale = Math.max(cw / image.width, ch / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const dx = (cw - drawWidth) / 2;
    const dy = (ch - drawHeight) / 2;
    this.ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  }

  private updateDebugPanel(): void {
    if (this.debugPosition) {
      this.debugPosition.textContent = `X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`;
    }
    if (this.debugVelocity) {
      this.debugVelocity.textContent = `VY: ${this.player.vy.toFixed(1)}`;
    }
    if (this.debugGrounded) {
      this.debugGrounded.textContent = `Grounded: ${this.player.isGroundedNow()}`;
    }
    if (this.debugLadder) {
      this.debugLadder.textContent = `On Ladder: ${this.player.isOnLadderNow()}`;
    }
    if (this.debugScene) {
      this.debugScene.textContent = `Scene: ${this.currentScene}`;
    }
  }

  private update(): void {
    this.audio.setBackgroundMusicActive(true);

    const touchingLadder = this.ropes.some((rope) => Physics.isColliding(this.player, rope));
    this.player.update(this.input, touchingLadder);

    const climbingUpLadder = touchingLadder && this.input.isClimbingUp();
    for (const platform of this.platforms) {
      this.player.collideWithPlatform(platform, climbingUpLadder);
    }

    const nearbyPortal = this.portals.find((portal) => Physics.isColliding(this.player, portal)) ?? null;
    this.activePortalHint = nearbyPortal;

    const interactPressed = this.input.isClimbingUp();
    if (nearbyPortal && interactPressed && !this.wasInteractPressed) {
      this.audio.play('portalEnter');
      if (nearbyPortal.sectionId === 'main') {
        this.initializeScene('main');
      } else {
        this.initializeScene(nearbyPortal.sectionId as SceneId);
      }
    }
    this.wasInteractPressed = interactPressed;

    if (this.player.x < 0) {
      this.player.x = 0;
      this.player.vx = 0;
    }

    const sceneWidth = this.getCurrentSceneWidth();
    if (this.player.x + this.player.width > sceneWidth) {
      this.player.x = sceneWidth - this.player.width;
      this.player.vx = 0;
    }

    if (this.player.y > this.canvas.height) {
      this.player.y = 100;
      this.player.vy = 0;
    }

    const jumpedThisFrame = this.wasGroundedLastFrame && !this.player.isGroundedNow() && this.player.vy < -0.5;
    if (jumpedThisFrame) {
      this.audio.play('jump');
    }
    this.wasGroundedLastFrame = this.player.isGroundedNow();

    this.audio.setWalkingActive(this.player.isWalkingOnGroundNow());
    this.updateCamera();
    this.updateDebugPanel();
  }

  private renderSceneTitle(): void {
    if (this.currentScene === 'main') {
      return;
    }

    const section = this.getSection(this.currentScene);
    const fallback = gameConfig.scenes[this.currentScene];
    const title = section?.roomTitle || fallback.roomTitle;
    const subtitle = section?.roomSubtitle || fallback.roomSubtitle;

    const boxWidth = 760;
    const boxHeight = 80;
    const x = (this.canvas.width - boxWidth) / 2;
    const y = 18;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    this.ctx.fillRect(x, y, boxWidth, boxHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 32px Segoe UI';
    this.ctx.fillText(title, this.canvas.width / 2, y + 34);
    this.ctx.font = '14px Segoe UI';
    this.ctx.fillText(subtitle, this.canvas.width / 2, y + 60);
    this.ctx.textAlign = 'start';
  }

  private drawItemCard(x: number, y: number, width: number, height: number, title: string, description: string, image?: string): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.93)';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#1d3557';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, width, height);

    const imageObj = this.getImage(image);
    if (imageObj) {
      this.ctx.drawImage(imageObj, x + 10, y + 10, width - 20, 90);
    } else {
      this.ctx.fillStyle = '#dde5f5';
      this.ctx.fillRect(x + 10, y + 10, width - 20, 90);
      this.ctx.fillStyle = '#576b95';
      this.ctx.font = '12px Segoe UI';
      this.ctx.fillText('Add image path in portfolioData.ts', x + 18, y + 62);
    }

    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = 'bold 16px Segoe UI';
    this.ctx.fillText(title, x + 12, y + 122);

    this.ctx.font = '13px Segoe UI';
    this.ctx.fillText(description, x + 12, y + 146);
  }

  private renderProjectsGallery(section: SectionData): void {
    const projects = section.projects ?? [];
    const imageWidth = 190;
    const imageHeight = 190;
    const gap = 34;
    const marginX = 120;
    const baseY = 195;
    const now = performance.now() * 0.001;

    this.projectHitAreas = [];

    for (let index = 0; index < projects.length; index++) {
      const project = projects[index];
      const x = marginX + index * (imageWidth + gap);
      const floatOffset = Math.sin(now * 1.1 + index * 0.8) * 9;
      const y = baseY + floatOffset;

      const shadowAlpha = 0.22 + Math.abs(floatOffset) * 0.008;
      this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(shadowAlpha, 0.4)})`;
      this.ctx.beginPath();
      this.ctx.ellipse(x + imageWidth / 2, y + imageHeight + 18, 66, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();

      const image = this.getImage(project.image);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      this.ctx.fillRect(x, y, imageWidth, imageHeight);
      this.ctx.strokeStyle = '#ffd166';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x, y, imageWidth, imageHeight);

      if (image) {
        this.ctx.drawImage(image, x + 6, y + 6, imageWidth - 12, imageHeight - 12);
      } else {
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(x + 6, y + 6, imageWidth - 12, imageHeight - 12);
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = '12px Segoe UI';
        this.ctx.fillText('Missing image', x + 50, y + 102);
      }

      this.ctx.fillStyle = 'rgba(7, 10, 20, 0.82)';
      this.ctx.fillRect(x, y + imageHeight + 8, imageWidth, 52);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 14px Segoe UI';
      this.ctx.fillText(project.title, x + 8, y + imageHeight + 28, imageWidth - 16);
      this.ctx.font = '11px Segoe UI';
      this.ctx.fillStyle = '#c7d2fe';
      this.ctx.fillText('Click to open project link', x + 8, y + imageHeight + 47, imageWidth - 16);

      this.projectHitAreas.push({
        x,
        y,
        width: imageWidth,
        height: imageHeight + 52,
        project,
      });
    }
  }

  private renderWorkFactory(section: SectionData): void {
    this.ctx.fillStyle = '#1b263b';
    this.ctx.fillRect(100, 430, 1000, 42);
    this.ctx.fillStyle = '#415a77';
    for (let i = 0; i < 16; i++) {
      this.ctx.fillRect(110 + i * 62, 441, 36, 20);
    }

    const items = section.items ?? [];
    items.forEach((item, index) => {
      const x = 130 + index * 330;
      this.drawItemCard(x, 270, 290, 140, item.title, item.description, item.image);
    });
  }

  private renderAcademicLibrary(section: SectionData): void {
    for (let shelf = 0; shelf < 3; shelf++) {
      const shelfY = 220 + shelf * 120;
      this.ctx.fillStyle = '#7f5539';
      this.ctx.fillRect(80, shelfY, 1040, 16);
    }

    const items = section.items ?? [];
    items.forEach((item, index) => {
      const x = 110 + (index % 3) * 340;
      const y = 130 + Math.floor(index / 3) * 150;
      this.drawItemCard(x, y, 300, 130, item.title, item.description, item.image);
    });
  }

  private renderLanguagesHangar(section: SectionData): void {
    this.ctx.fillStyle = '#e5e5e5';
    this.ctx.fillRect(230, 355, 540, 56);
    this.ctx.fillRect(640, 340, 160, 24);
    this.ctx.fillRect(300, 325, 190, 20);
    this.ctx.fillRect(300, 410, 190, 20);

    const items = section.items ?? [];
    items.forEach((item, index) => {
      const x = 120 + index * 165;
      const y = 220 + (index % 2) * 75;
      this.drawItemCard(x, y, 150, 120, item.title, item.description, item.image);
    });
  }

  private renderSkillsWorkshop(section: SectionData): void {
    this.ctx.fillStyle = '#2f2f2f';
    this.ctx.fillRect(120, 390, 960, 24);
    this.ctx.fillStyle = '#7c5c3a';
    this.ctx.fillRect(520, 340, 170, 50);
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillRect(550, 310, 110, 30);

    const items = section.items ?? [];
    items.slice(0, 6).forEach((item, index) => {
      const x = 170 + index * 155;
      this.ctx.fillStyle = '#c0c0c0';
      this.ctx.fillRect(x, 270, 12, 110);
      this.ctx.fillStyle = '#8b5a2b';
      this.ctx.fillRect(x - 8, 380, 28, 10);
      this.ctx.fillStyle = '#f8f9fa';
      this.ctx.font = '12px Segoe UI';
      this.ctx.fillText(item.title, x - 32, 250);
    });
  }

  private renderAboutRoom(section: SectionData): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.fillRect(120, 145, 960, 410);

    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = 'bold 20px Segoe UI';
    this.ctx.fillText(section.content, 150, 205, 900);

    const items = section.items ?? [];
    items.forEach((item, index) => {
      const x = 150 + index * 320;
      this.drawItemCard(x, 260, 280, 160, item.title, item.description);
    });
  }

  private renderSectionSceneContent(): void {
    if (this.currentScene === 'main') {
      this.projectHitAreas = [];
      return;
    }

    const section = this.getSection(this.currentScene);
    if (!section) {
      return;
    }

    if (this.currentScene === 'projects') {
      this.renderProjectsGallery(section);
    } else if (this.currentScene === 'about') {
      this.renderAboutRoom(section);
    } else if (this.currentScene === 'work-experience') {
      this.renderWorkFactory(section);
    } else if (this.currentScene === 'academic-experience') {
      this.renderAcademicLibrary(section);
    } else if (this.currentScene === 'languages') {
      this.renderLanguagesHangar(section);
    } else if (this.currentScene === 'skills') {
      this.renderSkillsWorkshop(section);
    } else {
      this.projectHitAreas = [];
    }
  }

  private renderBackground(): void {
    const sceneVisual = gameConfig.scenes[this.currentScene];
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, sceneVisual.backgroundGradient[0]);
    gradient.addColorStop(1, sceneVisual.backgroundGradient[1]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const sectionBackground = this.getSection(this.currentScene)?.backgroundImage;
    const image = this.getImage(sectionBackground || sceneVisual.backgroundImage);
    if (image) {
      this.drawImageCover(image);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private render(): void {
    this.renderBackground();

    this.ctx.save();
    this.ctx.translate(-this.cameraX, 0);

    if (this.currentScene !== 'main') {
      this.renderSectionSceneContent();
    }

    for (const platform of this.platforms) {
      platform.render(this.ctx);
    }

    for (const rope of this.ropes) {
      rope.render(this.ctx);
    }

    for (const portal of this.portals) {
      portal.render(this.ctx);
    }

    if (this.activePortalHint) {
      this.activePortalHint.renderHint(this.ctx);
    }

    this.player.render(this.ctx);
    this.ctx.restore();

    if (this.currentScene !== 'main') {
      this.renderSceneTitle();
    }
  }

  private gameLoop(): void {
    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  start(): void {
    this.gameLoop();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.audio.setBackgroundMusicActive(false);
    this.audio.setWalkingActive(false);
  }
}
