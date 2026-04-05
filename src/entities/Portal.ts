/**
 * Portal Entity
 * Interactive gateway to open a section's details
 */

import { AABB } from '../core/Physics';

export class Portal implements AABB {
  x: number;
  y: number;
  width: number;
  height: number;
  sectionId: string;
  label: string;

  constructor(x: number, y: number, sectionId: string, label: string) {
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 60;
    this.sectionId = sectionId;
    this.label = label;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Outer glow ring
    const glow = ctx.createRadialGradient(centerX, centerY, 6, centerX, centerY, 28);
    glow.addColorStop(0, 'rgba(88, 210, 255, 0.85)');
    glow.addColorStop(1, 'rgba(88, 210, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 24, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Portal body
    ctx.strokeStyle = '#137ba0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 16, 24, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0ea5c6';
    ctx.fillRect(centerX - 9, this.y + this.height + 4, 18, 6);
  }

  renderHint(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.font = '12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Press Up to enter', this.x + this.width / 2, this.y - 8);
    ctx.textAlign = 'start';
  }
}