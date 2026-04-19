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

interface UiHitArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProjectHitArea extends UiHitArea {
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
  private homeHitArea: UiHitArea | null = null;
  private cameraX = 0;
  private projectReelIndex = 0;
  private reelTouchStart: { x: number; y: number } | null = null;
  private wasCarouselLeftPressed: boolean = false;
  private wasCarouselRightPressed: boolean = false;

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
    this.initializeTouchControls();
    this.audio.setBackgroundMusicActive(true);
    this.initializeScene('main');
    hydratePortfolioSectionsFromAssets().catch(() => {
      // Keep default fallback content if text assets are unavailable.
    });
    this.start();
  }

  private initializePointerInteraction(): void {
    this.canvas.addEventListener('mousemove', (event) => {
      if (this.currentScene === 'main') {
        this.canvas.style.cursor = 'default';
        return;
      }

      const { x, y } = this.getCanvasCoordinates(event);
      const hoveringHome = this.homeHitArea ? this.isPointInArea(x, y, this.homeHitArea) : false;
      if (hoveringHome) {
        this.canvas.style.cursor = 'pointer';
        return;
      }

      if (this.currentScene !== 'projects') {
        this.canvas.style.cursor = 'default';
        return;
      }

      const hoveredProject = this.projectHitAreas.find((area) => this.isPointInArea(x + this.cameraX, y, area));
      this.canvas.style.cursor = hoveredProject ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', (event) => {
      if (this.currentScene === 'main') {
        return;
      }

      const { x, y } = this.getCanvasCoordinates(event);
      if (this.homeHitArea && this.isPointInArea(x, y, this.homeHitArea)) {
        this.audio.play('portalEnter');
        this.initializeScene('main');
        return;
      }

      if (this.currentScene !== 'projects') {
        return;
      }

      if (x < 110) {
        this.cycleProject(-1);
        return;
      }

      if (x > this.canvas.width - 110) {
        this.cycleProject(1);
        return;
      }

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

    this.canvas.addEventListener('touchstart', (event) => {
      if (this.currentScene !== 'projects' || event.touches.length === 0) {
        return;
      }

      const touch = event.touches[0];
      this.reelTouchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    this.canvas.addEventListener('touchend', (event) => {
      if (this.currentScene !== 'projects' || !this.reelTouchStart || event.changedTouches.length === 0) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - this.reelTouchStart.x;
      const deltaY = touch.clientY - this.reelTouchStart.y;
      this.reelTouchStart = null;

      if (Math.abs(deltaX) < 36 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      this.cycleProject(deltaX < 0 ? 1 : -1);
    }, { passive: true });
  }

  private initializeTouchControls(): void {
    const controlsRoot = document.getElementById('mobile-controls');
    const joystickBase = document.getElementById('mobile-joystick');
    const joystickThumb = document.getElementById('mobile-joystick-thumb');
    const jumpButton = document.getElementById('mobile-jump');

    if (!controlsRoot || !joystickBase || !joystickThumb || !jumpButton) {
      return;
    }

    let activeJoystickPointerId: number | null = null;
    const joystickRadius = 42;

    const resetJoystick = () => {
      this.input.setVirtualMoveX(0);
      this.input.setVirtualClimb(false, false);
      joystickThumb.style.transform = 'translate(-50%, -50%)';
    };

    const updateJoystick = (clientX: number, clientY: number) => {
      const rect = joystickBase.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const clampScale = distance > joystickRadius ? joystickRadius / distance : 1;
      const clampedDx = dx * clampScale;
      const clampedDy = dy * clampScale;

      const moveX = clampedDx / joystickRadius;
      const moveY = clampedDy / joystickRadius;

      this.input.setVirtualMoveX(moveX);
      this.input.setVirtualClimb(moveY < -0.38, moveY > 0.38);

      joystickThumb.style.transform = `translate(calc(-50% + ${clampedDx}px), calc(-50% + ${clampedDy}px))`;
    };

    joystickBase.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      activeJoystickPointerId = event.pointerId;
      joystickBase.setPointerCapture(event.pointerId);
      updateJoystick(event.clientX, event.clientY);
    });

    joystickBase.addEventListener('pointermove', (event) => {
      if (event.pointerId !== activeJoystickPointerId) {
        return;
      }
      event.preventDefault();
      updateJoystick(event.clientX, event.clientY);
    });

    const releaseJoystickPointer = (event: PointerEvent) => {
      if (event.pointerId !== activeJoystickPointerId) {
        return;
      }
      activeJoystickPointerId = null;
      resetJoystick();
    };

    joystickBase.addEventListener('pointerup', releaseJoystickPointer);
    joystickBase.addEventListener('pointercancel', releaseJoystickPointer);
    joystickBase.addEventListener('lostpointercapture', () => {
      activeJoystickPointerId = null;
      resetJoystick();
    });

    const setJump = (active: boolean) => {
      this.input.setVirtualJump(active);
      jumpButton.classList.toggle('pressed', active);
    };

    jumpButton.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      jumpButton.setPointerCapture(event.pointerId);
      setJump(true);
    });

    jumpButton.addEventListener('pointerup', () => setJump(false));
    jumpButton.addEventListener('pointercancel', () => setJump(false));
    jumpButton.addEventListener('lostpointercapture', () => setJump(false));

    controlsRoot.addEventListener('contextmenu', (event) => event.preventDefault());
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

  private isPointInArea(x: number, y: number, area: UiHitArea): boolean {
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

  private initializeSectionScene(sceneId: Exclude<SceneId, 'main'>): void {
    const sceneWidth = this.getSceneTargetWidth(sceneId);

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

    if (sceneId === 'projects') {
      const projectCount = this.getSection('projects')?.projects?.length ?? 0;
      if (projectCount === 0) {
        this.projectReelIndex = 0;
      } else {
        this.projectReelIndex = ((this.projectReelIndex % projectCount) + projectCount) % projectCount;
      }
    }
  }

  private getSceneTargetWidth(sceneId: SceneId): number {
    if (sceneId === 'projects') {
      return gameConfig.canvas.width;
    }

    if (sceneId === 'main') {
      let maxRight = gameConfig.canvas.width;
      for (const platform of gameConfig.mainScene.platforms) {
        maxRight = Math.max(maxRight, platform.x + platform.width);
      }
      for (const rope of gameConfig.mainScene.ropes) {
        maxRight = Math.max(maxRight, rope.x + (rope.width ?? 20));
      }
      return maxRight;
    }

    return gameConfig.canvas.width;
  }

  private getCurrentSceneWidth(): number {
    return this.getSceneTargetWidth(this.currentScene);
  }

  private isCoarsePointerDevice(): boolean {
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  private updateCamera(): void {
    const sceneWidth = this.getCurrentSceneWidth();
    const maxCamera = Math.max(0, sceneWidth - this.canvas.width);
    const isCoarsePointer = this.isCoarsePointerDevice();

    if (this.currentScene === 'main' && !isCoarsePointer) {
      this.cameraX = 0;
      return;
    }

    if (maxCamera <= 0) {
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
    this.wasCarouselLeftPressed = false;
    this.wasCarouselRightPressed = false;
    this.reelTouchStart = null;

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

  private cycleProject(direction: number): void {
    const projects = this.getSection('projects')?.projects ?? [];
    if (projects.length === 0) {
      this.projectReelIndex = 0;
      return;
    }

    this.projectReelIndex = (this.projectReelIndex + direction + projects.length) % projects.length;
    this.audio.play('portalEnter');
  }

  private renderHomeIcon(): void {
    if (this.currentScene === 'main') {
      this.homeHitArea = null;
      return;
    }

    const size = 58;
    const padding = 18;
    const x = this.canvas.width - size - padding;
    const y = this.canvas.height - size - padding;

    this.homeHitArea = { x, y, width: size, height: size };

    this.ctx.fillStyle = 'rgba(13, 17, 31, 0.74)';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, size, size, 16);
    this.ctx.fill();

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 16, y + 31);
    this.ctx.lineTo(x + 29, y + 19);
    this.ctx.lineTo(x + 42, y + 31);
    this.ctx.stroke();
    this.ctx.strokeRect(x + 21, y + 31, 16, 14);
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

    if (this.currentScene === 'projects') {
      const leftPressed = this.input.isMovingLeft();
      const rightPressed = this.input.isMovingRight();

      if (leftPressed && !this.wasCarouselLeftPressed) {
        this.cycleProject(-1);
      }
      if (rightPressed && !this.wasCarouselRightPressed) {
        this.cycleProject(1);
      }

      this.wasCarouselLeftPressed = leftPressed;
      this.wasCarouselRightPressed = rightPressed;
    }

    if (this.player.x < 0) {
      this.player.x = 0;
      this.player.vx = 0;
    }

    const isCoarsePointer = this.isCoarsePointerDevice();
    const sceneWidth = this.currentScene === 'main' && !isCoarsePointer ? this.canvas.width : this.getCurrentSceneWidth();
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

    const y = 40;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 32px Segoe UI';
    this.ctx.fillText(title, this.canvas.width / 2, y);
    this.ctx.font = '14px Segoe UI';
    this.ctx.fillText(subtitle, this.canvas.width / 2, y + 24);
    this.ctx.textAlign = 'start';
  }

  private renderSectionList(items: Array<{ title: string; description: string }>, startX: number, startY: number): void {
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = 'bold 24px Segoe UI';

    let y = startY;
    items.forEach((item) => {
      this.ctx.fillText(`- ${item.title}`, startX, y, this.canvas.width - startX * 2);
      y += 28;
      this.ctx.fillStyle = '#dbeafe';
      this.ctx.font = '18px Segoe UI';
      this.ctx.fillText(item.description, startX + 18, y, this.canvas.width - (startX + 18) * 2);
      y += 44;
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = 'bold 24px Segoe UI';
    });
  }

  private renderProjectsGallery(section: SectionData): void {
    const projects = section.projects ?? [];

    this.projectHitAreas = [];
    if (projects.length === 0) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 30px Segoe UI';
      this.ctx.fillText('No projects found', 120, 320);
      return;
    }

    const project = projects[this.projectReelIndex % projects.length];
    const imageX = 120;
    const imageY = 130;
    const imageWidth = this.canvas.width - 240;
    const imageHeight = 360;
    const image = this.getImage(project.image);

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    this.ctx.fillRect(imageX + 8, imageY + 10, imageWidth, imageHeight);

    if (image) {
      this.ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);
    } else {
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = '22px Segoe UI';
      this.ctx.fillText('Missing image', imageX + 40, imageY + 60);
    }

    this.ctx.fillStyle = 'rgba(7, 10, 20, 0.72)';
    this.ctx.fillRect(imageX, imageY + imageHeight - 96, imageWidth, 96);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 30px Segoe UI';
    this.ctx.fillText(project.title, imageX + 20, imageY + imageHeight - 58, imageWidth - 40);

    this.ctx.font = '19px Segoe UI';
    this.ctx.fillStyle = '#c7d2fe';
    this.ctx.fillText(project.description, imageX + 20, imageY + imageHeight - 24, imageWidth - 40);

    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 20px Segoe UI';
    this.ctx.fillText(`Project ${this.projectReelIndex + 1}/${projects.length}  Swipe left/right`, imageX, imageY + imageHeight + 54);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '36px Segoe UI';
    this.ctx.fillText('‹', 70, imageY + imageHeight / 2 + 10);
    this.ctx.fillText('›', this.canvas.width - 90, imageY + imageHeight / 2 + 10);

    this.projectHitAreas.push({
      x: imageX,
      y: imageY,
      width: imageWidth,
      height: imageHeight,
      project,
    });

    const sectionButtonsY = imageY + imageHeight + 96;
    this.ctx.font = '17px Segoe UI';
    this.ctx.fillStyle = '#bfdbfe';
    this.ctx.fillText('Tip: swipe on the image to cycle projects. Tap image to open project.', imageX, sectionButtonsY);
  }

  private renderWorkFactory(section: SectionData): void {
    this.ctx.fillStyle = '#1b263b';
    this.ctx.fillRect(100, 430, 1000, 42);
    this.ctx.fillStyle = '#415a77';
    for (let i = 0; i < 16; i++) {
      this.ctx.fillRect(110 + i * 62, 441, 36, 20);
    }

    const items = section.items ?? [];
    this.renderSectionList(items, 120, 180);
  }

  private renderAcademicLibrary(section: SectionData): void {
    for (let shelf = 0; shelf < 3; shelf++) {
      const shelfY = 220 + shelf * 120;
      this.ctx.fillStyle = '#7f5539';
      this.ctx.fillRect(80, shelfY, 1040, 16);
    }

    const items = section.items ?? [];
    this.renderSectionList(items, 120, 170);
  }

  private renderLanguagesHangar(section: SectionData): void {
    this.ctx.fillStyle = '#e5e5e5';
    this.ctx.fillRect(230, 355, 540, 56);
    this.ctx.fillRect(640, 340, 160, 24);
    this.ctx.fillRect(300, 325, 190, 20);
    this.ctx.fillRect(300, 410, 190, 20);

    const items = section.items ?? [];
    this.renderSectionList(items, 120, 170);
  }

  private renderSkillsWorkshop(section: SectionData): void {
    this.ctx.fillStyle = '#2f2f2f';
    this.ctx.fillRect(120, 390, 960, 24);
    this.ctx.fillStyle = '#7c5c3a';
    this.ctx.fillRect(520, 340, 170, 50);
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillRect(550, 310, 110, 30);

    const items = section.items ?? [];
    this.renderSectionList(items.slice(0, 8), 120, 170);
  }

  private renderAboutRoom(section: SectionData): void {
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = 'bold 20px Segoe UI';
    this.ctx.fillText(section.content, 150, 205, 900);

    const items = section.items ?? [];
    this.renderSectionList(items, 150, 270);
  }

  private renderSectionSceneContent(): void {
    if (this.currentScene === 'main') {
      this.projectHitAreas = [];
      return;
    }

    const section = this.getSection(this.currentScene);
    if (!section) {
      this.projectHitAreas = [];
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

  private renderBackground(sceneWidth: number, alignToWorld: boolean): void {
    const sceneVisual = gameConfig.scenes[this.currentScene];
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, sceneVisual.backgroundGradient[0]);
    gradient.addColorStop(1, sceneVisual.backgroundGradient[1]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, alignToWorld ? sceneWidth : this.canvas.width, this.canvas.height);

    const sectionBackground = this.getSection(this.currentScene)?.backgroundImage;
    const image = this.getImage(sectionBackground || sceneVisual.backgroundImage);
    if (image) {
      if (alignToWorld) {
        this.ctx.drawImage(image, 0, 0, sceneWidth, this.canvas.height);
      } else {
        this.drawImageCover(image);
      }
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      this.ctx.fillRect(0, 0, alignToWorld ? sceneWidth : this.canvas.width, this.canvas.height);
    }
  }

  private render(): void {
    const sceneWidth = this.getCurrentSceneWidth();
    const followWorldBackground = this.currentScene === 'main' && this.isCoarsePointerDevice() && sceneWidth > this.canvas.width;

    if (followWorldBackground) {
      this.ctx.save();
      this.ctx.translate(-this.cameraX, 0);
      this.renderBackground(sceneWidth, true);
    } else {
      this.renderBackground(sceneWidth, false);
      this.ctx.save();
      this.ctx.translate(-this.cameraX, 0);
    }

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
      this.renderHomeIcon();
    } else {
      this.homeHitArea = null;
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
