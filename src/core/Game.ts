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

    this.initializeLevel();
    this.start();
  }

  private syncCanvasSize(): void {
    const width = this.canvas.clientWidth || 1200;
    const height = this.canvas.clientHeight || 700;

    // Keep the internal drawing buffer aligned with CSS layout size.
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private initializeLevel(): void {
    // Create a simple platformer level
    this.platforms = [
      // Ground platform
      new Platform({
        id: 'ground',
        x: 0,
        y: 600,
        width: 1200,
        height: 100,
        color: '#228B22',
      }),

      // Left platform (About section)
      new Platform({
        id: 'platform-left',
        x: 100,
        y: 480,
        width: 200,
        height: 40,
        section: 'About',
        color: '#4169E1',
      }),

      // Center platform (Skills section)
      new Platform({
        id: 'platform-center',
        x: 500,
        y: 350,
        width: 200,
        height: 40,
        section: 'Skills',
        color: '#FF8C00',
      }),

      // Right platform (Projects section)
      new Platform({
        id: 'platform-right',
        x: 900,
        y: 480,
        width: 200,
        height: 40,
        section: 'Projects',
        color: '#DC143C',
      }),

      // High platform (Experience section)
      new Platform({
        id: 'platform-high',
        x: 300,
        y: 200,
        width: 200,
        height: 40,
        section: 'Experience',
        color: '#9370DB',
      }),
    ];

    // Create ropes
    this.ropes = [
      new Rope(320, 160, 220), // Left ladder through experience platform
      new Rope(620, 300, 240), // Right ladder through skills platform
    ];

    this.portals = this.platforms
      .filter((platform) => !!platform.section)
      .map((platform) => {
        const sectionId = platform.section!.toLowerCase();
        const portalX = platform.x + platform.width / 2 - 22;
        const portalY = platform.y - 66;
        return new Portal(portalX, portalY, sectionId, platform.section!);
      });
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
      this.openSectionModalById(nearbyPortal.sectionId);
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
    // Clear canvas with gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw clouds (decorative)
    this.renderClouds();

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

  private renderDebugInfo(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`, 10, 20);
    this.ctx.fillText(`VY: ${this.player.vy.toFixed(1)}`, 10, 35);
    this.ctx.fillText(`Grounded: ${this.player.isGroundedNow()}`, 10, 50);
    this.ctx.fillText(`On Ladder: ${this.player.isOnLadderNow()}`, 10, 65);
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

  private openSectionModalById(sectionId: string): void {
    const section = portfolioSections.find((item) => item.id === sectionId);
    if (!section || !this.modal || !this.modalOverlay || !this.modalTitle || !this.modalContent) {
      return;
    }

    this.populateModalContent(section);
    this.modalOverlay.classList.add('active');
    this.modal.classList.add('active');
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
