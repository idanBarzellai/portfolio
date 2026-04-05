/**
 * Platform Entity
 * Represents solid platforms in the game world
 */

import { AABB } from '../core/Physics';

export interface PlatformData extends AABB {
  id: string;
  section?: string;
  color?: string;
}

export class Platform implements AABB {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  section?: string;
  color: string;

  constructor(data: PlatformData) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.id = data.id;
    this.section = data.section;
    this.color = data.color || '#8B4513';
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw platform
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw border
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw pattern for visual interest
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < this.width; i += 20) {
      ctx.fillRect(this.x + i, this.y + 5, 15, 5);
    }

    if (this.section) {
      ctx.fillStyle = '#1f1f1f';
      ctx.font = 'bold 18px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(this.section, this.x + this.width / 2, this.y - 12);
      ctx.textAlign = 'start';
    }
  }
}
