/**
 * Rope Entity
 * Allows player to climb vertically
 */

import { AABB } from '../core/Physics';

export class Rope implements AABB {
  x: number;
  y: number;
  width: number = 20;
  height: number;

  constructor(x: number, y: number, height: number) {
    this.x = x;
    this.y = y;
    this.height = height;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw rope as a series of circles
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height);
    ctx.stroke();

    // Draw rope texture
    for (let i = 0; i < this.height; i += 20) {
      ctx.fillStyle = '#CD853F';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + i, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
