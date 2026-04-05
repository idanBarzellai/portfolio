/**
 * Main Game Class
 * Handles the game loop, rendering, and update logic
 */

import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { Rope } from '../entities/Rope';
import { Portal } from '../entities/Portal';
import { Input } from './Input';
import { portfolioSections, SectionData } from '../data/portfolioData';
import { Physics } from './Physics';

type SceneId = 'main' | 'projects' | 'work-experience' | 'academic-experience' | 'languages' | 'skills';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: Input;
  private player: Player;
  private platforms: Platform[] = [];
  private ropes: Rope[] = [];
  private portals: Portal[] = [];
  private animationFrameId: number | null = null;
  private wasInteractPressed: boolean = false;
  private activePortalHint: Portal | null = null;
  private currentScene: SceneId = 'main';

  private modalOverlay: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private modalTitle: HTMLElement | null = null;
  private modalContent: HTMLElement | null = null;
  private modalConfirm: HTMLButtonElement | null = null;
  private modalCancel: HTMLButtonElement | null = null;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.syncCanvasSize();
    window.addEventListener('resize', () => this.syncCanvasSize());
    this.input = new Input();
    this.player = new Player(100, 200);
    this.initializeUI();

    this.initializeScene('main');
    this.start();
  }

  private syncCanvasSize(): void {
    const width = this.canvas.clientWidth || 1200;
    const height = this.canvas.clientHeight || 700;

    // Keep the internal drawing buffer aligned with CSS layout size.
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private initializeMainScene(): void {
    this.platforms = [
      new Platform({
        id: 'ground',
        x: 0,
        y: 600,
        width: 1200,
        height: 100,
        color: '#228B22',
      }),
      new Platform({
        id: 'platform-skills',
        x: 100,
        y: 480,
        width: 200,
        height: 40,
        section: 'Skills',
        sectionId: 'skills',
        color: '#4169E1',
      }),
      new Platform({
        id: 'platform-projects',
        x: 500,
        y: 350,
        width: 200,
        height: 40,
        section: 'Projects',
        sectionId: 'projects',
        color: '#FF8C00',
      }),
      new Platform({
        id: 'platform-languages',
        x: 900,
        y: 480,
        width: 200,
        height: 40,
        section: 'Languages',
        sectionId: 'languages',
        color: '#DC143C',
      }),
      new Platform({
        id: 'platform-work',
        x: 300,
        y: 200,
        width: 200,
        height: 40,
        section: 'Work Experience',
        sectionId: 'work-experience',
        color: '#9370DB',
      }),
      new Platform({
        id: 'platform-academic',
        x: 760,
        y: 220,
        width: 220,
        height: 40,
        section: 'Academic Experience',
        sectionId: 'academic-experience',
        color: '#2E8B57',
      }),
    ];

    this.ropes = [
      new Rope(320, 160, 240),
      new Rope(620, 300, 240),
      new Rope(860, 180, 320),
    ];

    this.portals = this.platforms
      .filter((platform) => !!platform.section && !!platform.sectionId)
      .map((platform) => {
        const sectionId = platform.sectionId!;
        const portalX = platform.x + platform.width / 2 - 22;
        const portalY = platform.y - 66;
        return new Portal(portalX, portalY, sectionId, platform.section!);
      });

    this.player.x = 110;
    this.player.y = 520;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  private initializeSectionScene(sceneId: Exclude<SceneId, 'main'>): void {
    this.platforms = [
      new Platform({
        id: 'section-ground',
        x: 0,
        y: 600,
        width: 1200,
        height: 100,
        color: '#2F4F4F',
      }),
    ];
    this.ropes = [];
    this.portals = [new Portal(60, 520, 'main', 'Exit')];

    this.player.x = 150;
    this.player.y = 520;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  private initializeScene(sceneId: SceneId): void {
    this.currentScene = sceneId;
    this.activePortalHint = null;
    this.wasInteractPressed = false;

    if (sceneId === 'main') {
      this.initializeMainScene();
      return;
    }

    this.initializeSectionScene(sceneId);
  }

  private update(): void {
    const touchingLadder = this.ropes.some((rope) => Physics.isColliding(this.player, rope));

    // Update player
    this.player.update(this.input, touchingLadder);

    // Handle collisions with platforms
    const climbingUpLadder = touchingLadder && this.input.isClimbingUp();
    for (const platform of this.platforms) {
      this.player.collideWithPlatform(platform, climbingUpLadder);
    }

    const nearbyPortal = this.portals.find((portal) => Physics.isColliding(this.player, portal)) ?? null;
    this.activePortalHint = nearbyPortal;

    const interactPressed = this.input.isClimbingUp();
    if (nearbyPortal && interactPressed && !this.wasInteractPressed) {
      if (nearbyPortal.sectionId === 'main') {
        this.initializeScene('main');
      } else {
        this.initializeScene(nearbyPortal.sectionId as SceneId);
      }
    }
    this.wasInteractPressed = interactPressed;

    // Keep player in bounds (horizontally)
    if (this.player.x < 0) {
      this.player.x = 0;
      this.player.vx = 0;
    }
    if (this.player.x + this.player.width > this.canvas.width) {
      this.player.x = this.canvas.width - this.player.width;
      this.player.vx = 0;
    }

    // Kill player if they fall
    if (this.player.y > this.canvas.height) {
      this.player.y = 100;
      this.player.vy = 0;
    }
  }

  private render(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    if (this.currentScene === 'main') {
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
    } else if (this.currentScene === 'projects') {
      gradient.addColorStop(0, '#27213C');
      gradient.addColorStop(1, '#3B2F63');
    } else if (this.currentScene === 'work-experience') {
      gradient.addColorStop(0, '#4A4E69');
      gradient.addColorStop(1, '#22223B');
    } else if (this.currentScene === 'academic-experience') {
      gradient.addColorStop(0, '#A8DADC');
      gradient.addColorStop(1, '#457B9D');
    } else if (this.currentScene === 'languages') {
      gradient.addColorStop(0, '#90E0EF');
      gradient.addColorStop(1, '#0077B6');
    } else {
      gradient.addColorStop(0, '#5A3F37');
      gradient.addColorStop(1, '#2C1E1A');
    }

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentScene === 'main') {
      this.renderClouds();
    } else {
      this.renderSceneSetPieces();
    }

    // Draw platforms
    for (const platform of this.platforms) {
      platform.render(this.ctx);
    }

    // Draw ropes
    for (const rope of this.ropes) {
      rope.render(this.ctx);
    }

    // Draw portals
    for (const portal of this.portals) {
      portal.render(this.ctx);
    }

    if (this.activePortalHint) {
      this.activePortalHint.renderHint(this.ctx);
    }

    // Draw player
    this.player.render(this.ctx);

    // Draw debug info
    this.renderDebugInfo();
  }

  private renderClouds(): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    const time = Date.now() * 0.0001;
    for (let i = 0; i < 3; i++) {
      const x = (i * 400 + time * 50) % this.canvas.width;
      const y = 50 + i * 30;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 30, 0, Math.PI * 2);
      this.ctx.arc(x + 40, y, 40, 0, Math.PI * 2);
      this.ctx.arc(x + 80, y, 30, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private renderSceneSetPieces(): void {
    if (this.currentScene === 'projects') {
      this.renderProjectsGallery();
      return;
    }
    if (this.currentScene === 'work-experience') {
      this.renderWorkFactory();
      return;
    }
    if (this.currentScene === 'academic-experience') {
      this.renderAcademicLibrary();
      return;
    }
    if (this.currentScene === 'languages') {
      this.renderLanguagesHangar();
      return;
    }
    if (this.currentScene === 'skills') {
      this.renderSkillsWorkshop();
    }
  }

  private renderSceneTitle(title: string, subtitle: string): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.fillRect(18, 14, 520, 72);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 28px Segoe UI';
    this.ctx.fillText(title, 30, 46);
    this.ctx.font = '14px Segoe UI';
    this.ctx.fillText(subtitle, 30, 70);
  }

  private getSection(sectionId: string): SectionData | undefined {
    return portfolioSections.find((section) => section.id === sectionId);
  }

  private renderProjectsGallery(): void {
    const section = this.getSection('projects');
    this.renderSceneTitle('Projects Gallery', 'Walk through your featured project frames.');

    const projects = section?.projects ?? [];
    const cardWidth = 260;
    const gap = 28;
    let x = 140;
    const y = 180;

    for (const project of projects) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      this.ctx.fillRect(x, y, cardWidth, 220);
      this.ctx.strokeStyle = '#B8A16A';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(x, y, cardWidth, 220);

      this.ctx.fillStyle = '#1d1d1d';
      this.ctx.font = 'bold 18px Segoe UI';
      this.ctx.fillText(project.title, x + 14, y + 34);

      this.ctx.font = '14px Segoe UI';
      this.ctx.fillText(project.description, x + 14, y + 64);
      this.ctx.fillText(project.tags.join(' | '), x + 14, y + 94);

      x += cardWidth + gap;
    }
  }

  private renderWorkFactory(): void {
    const section = this.getSection('work-experience');
    this.renderSceneTitle('Factory of Experience', 'Each station on the line is a workplace milestone.');

    this.ctx.fillStyle = '#1b263b';
    this.ctx.fillRect(120, 420, 960, 40);
    this.ctx.fillStyle = '#415a77';
    for (let i = 0; i < 16; i++) {
      this.ctx.fillRect(130 + i * 58, 432, 36, 16);
    }

    const entries = (section?.content ?? '').split('•').map((item) => item.trim()).filter(Boolean);
    entries.forEach((entry, index) => {
      const x = 170 + index * 300;
      this.ctx.fillStyle = '#f4d35e';
      this.ctx.fillRect(x, 340, 210, 72);
      this.ctx.strokeStyle = '#ee964b';
      this.ctx.strokeRect(x, 340, 210, 72);
      this.ctx.fillStyle = '#1f2937';
      this.ctx.font = '13px Segoe UI';
      this.ctx.fillText(entry, x + 10, 382);
    });
  }

  private renderAcademicLibrary(): void {
    const section = this.getSection('academic-experience');
    this.renderSceneTitle('Academic Library', 'Each bookshelf row is a core academic reference area.');

    const entries = (section?.content ?? '').split('•').map((item) => item.trim()).filter(Boolean);
    for (let shelf = 0; shelf < 3; shelf++) {
      const shelfY = 210 + shelf * 110;
      this.ctx.fillStyle = '#7f5539';
      this.ctx.fillRect(120, shelfY, 960, 16);
    }

    entries.forEach((entry, index) => {
      const x = 150 + (index % 4) * 230;
      const y = 150 + Math.floor(index / 4) * 110;
      this.ctx.fillStyle = '#fefae0';
      this.ctx.fillRect(x, y, 180, 48);
      this.ctx.strokeStyle = '#bc6c25';
      this.ctx.strokeRect(x, y, 180, 48);
      this.ctx.fillStyle = '#283618';
      this.ctx.font = '12px Segoe UI';
      this.ctx.fillText(entry, x + 8, y + 28);
    });
  }

  private renderLanguagesHangar(): void {
    const section = this.getSection('languages');
    this.renderSceneTitle('Language Aircraft', 'The plane carries your development languages and stacks.');

    this.ctx.fillStyle = '#e5e5e5';
    this.ctx.fillRect(220, 310, 560, 56);
    this.ctx.fillRect(660, 295, 140, 24);
    this.ctx.fillRect(300, 278, 180, 20);
    this.ctx.fillRect(300, 366, 180, 20);
    this.ctx.fillStyle = '#1b263b';
    this.ctx.beginPath();
    this.ctx.arc(810, 324, 26, 0, Math.PI * 2);
    this.ctx.fill();

    const entries = (section?.content ?? '').split('•').map((item) => item.trim()).filter(Boolean);
    entries.forEach((entry, index) => {
      const x = 180 + index * 160;
      const y = 190 + (index % 2) * 66;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.fillRect(x, y, 130, 38);
      this.ctx.strokeStyle = '#003049';
      this.ctx.strokeRect(x, y, 130, 38);
      this.ctx.fillStyle = '#003049';
      this.ctx.font = 'bold 14px Segoe UI';
      this.ctx.fillText(entry, x + 12, y + 24);
    });
  }

  private renderSkillsWorkshop(): void {
    const section = this.getSection('skills');
    this.renderSceneTitle('Blacksmith Workshop', 'Each forged weapon represents one major skill.');

    this.ctx.fillStyle = '#2f2f2f';
    this.ctx.fillRect(130, 360, 940, 22);
    this.ctx.fillStyle = '#7c5c3a';
    this.ctx.fillRect(530, 320, 160, 40);
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillRect(560, 295, 100, 28);

    const entries = (section?.content ?? '').split('•').map((item) => item.trim()).filter(Boolean);
    entries.slice(0, 6).forEach((entry, index) => {
      const x = 180 + index * 160;
      this.ctx.fillStyle = '#c0c0c0';
      this.ctx.fillRect(x, 250, 10, 90);
      this.ctx.fillStyle = '#8b5a2b';
      this.ctx.fillRect(x - 6, 340, 22, 8);
      this.ctx.fillStyle = '#f8f9fa';
      this.ctx.font = '12px Segoe UI';
      this.ctx.fillText(entry, x - 32, 232);
    });
  }

  private renderDebugInfo(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`, 10, 20);
    this.ctx.fillText(`VY: ${this.player.vy.toFixed(1)}`, 10, 35);
    this.ctx.fillText(`Grounded: ${this.player.isGroundedNow()}`, 10, 50);
    this.ctx.fillText(`On Ladder: ${this.player.isOnLadderNow()}`, 10, 65);
    this.ctx.fillText(`Scene: ${this.currentScene}`, 10, 80);
  }

  private initializeUI(): void {
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modal = document.getElementById('modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalContent = document.getElementById('modal-content');
    this.modalConfirm = document.getElementById('modal-confirm') as HTMLButtonElement | null;
    this.modalCancel = document.getElementById('modal-cancel') as HTMLButtonElement | null;

    if (this.modalConfirm) {
      this.modalConfirm.textContent = 'Close';
      this.modalConfirm.addEventListener('click', () => this.closeModal());
    }

    if (this.modalCancel) {
      this.modalCancel.style.display = 'none';
    }

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', () => this.closeModal());
    }
  }

  private populateModalContent(section: SectionData): void {
    if (!this.modalTitle || !this.modalContent) {
      return;
    }

    this.modalTitle.textContent = section.title;
    this.modalContent.innerHTML = '';

    const body = document.createElement('p');
    body.textContent = section.content;
    this.modalContent.appendChild(body);

    if (section.projects && section.projects.length > 0) {
      const list = document.createElement('ul');
      list.style.marginTop = '12px';
      list.style.paddingLeft = '18px';

      for (const project of section.projects) {
        const item = document.createElement('li');
        item.style.marginBottom = '10px';

        const title = document.createElement('strong');
        title.textContent = project.title;
        item.appendChild(title);

        const description = document.createElement('div');
        description.textContent = project.description;
        description.style.fontSize = '0.95em';
        item.appendChild(description);

        if (project.link) {
          const link = document.createElement('a');
          link.href = project.link;
          link.textContent = 'View project';
          link.target = '_blank';
          link.rel = 'noreferrer noopener';
          link.style.display = 'inline-block';
          link.style.marginTop = '4px';
          item.appendChild(link);
        }

        list.appendChild(item);
      }

      this.modalContent.appendChild(list);
    }
  }

  private closeModal(): void {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('active');
    }
    if (this.modal) {
      this.modal.classList.remove('active');
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
  }
}
