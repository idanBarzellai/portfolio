/**
 * Rope Entity
 * Allows player to climb vertically
 */

import { AABB } from '../core/Physics';

export class Rope implements AABB {
  private static readonly spriteSrc = 'assets/Map/rope.png';
  private static spriteImage: HTMLImageElement | null = null;

  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, height: number, width: number = 36) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;

    if (!Rope.spriteImage) {
      Rope.spriteImage = new Image();
      Rope.spriteImage.src = Rope.spriteSrc;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const sprite = Rope.spriteImage;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      const previousSmoothing = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
      ctx.imageSmoothingEnabled = previousSmoothing;
      return;
    }

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
