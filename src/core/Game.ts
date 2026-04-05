/**
 * Main Game Class
 * Handles the game loop, rendering, and update logic
 */

import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { Rope } from '../entities/Rope';
import { Input } from './Input';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: Input;
  private player: Player;
  private platforms: Platform[] = [];
  private ropes: Rope[] = [];
  private animationFrameId: number | null = null;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.input = new Input();
    this.player = new Player(100, 200);

    this.initializeLevel();
    this.start();
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
      new Rope(320, 240, 110), // Left side rope
      new Rope(620, 390, 110), // Right side rope
    ];
  }

  private update(): void {
    // Update player
    this.player.update(this.input);

    // Handle collisions with platforms
    for (const platform of this.platforms) {
      this.player.collideWithPlatform(platform);
    }

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
