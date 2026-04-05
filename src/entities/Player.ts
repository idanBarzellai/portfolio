/**
 * Player Entity
 * Represents the player character in the game world
 */

import { Physics, AABB } from '../core/Physics';
import { Input } from '../core/Input';

export class Player implements AABB {
  x: number;
  y: number;
  width: number = 30;
  height: number = 40;

  vx: number = 0; // Velocity X
  vy: number = 0; // Velocity Y

  private moveSpeed: number = 5;
  private jumpPower: number = 12;
  private isGrounded: boolean = false;
  private canJump: boolean = true;
  private onRope: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(input: Input): void {
    // Horizontal movement
    this.vx = 0;
    if (input.isMovingLeft()) {
      this.vx = -this.moveSpeed;
    }
    if (input.isMovingRight()) {
      this.vx = this.moveSpeed;
    }

    // Jumping
    if (input.isJumping() && this.isGrounded && this.canJump) {
      this.vy = -this.jumpPower;
      this.isGrounded = false;
      this.canJump = false;
    } else if (!input.isJumping()) {
      this.canJump = true;
    }

    // Apply gravity (unless on rope)
    if (!this.onRope) {
      Physics.applyGravity(this);
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Reset grounded state
    this.isGrounded = false;
    this.onRope = false;
  }

  /**
   * Handle collision with a platform
   */
  collideWithPlatform(platform: AABB): void {
    if (!Physics.isColliding(this, platform)) return;

    const side = Physics.getCollisionSide(this, platform);
    if (side === 'top') {
      Physics.resolveCollision(this, platform, side);
      this.isGrounded = true;
    } else if (side) {
      Physics.resolveCollision(this, platform, side);
    }
  }

  /**
   * Handle rope interaction
   */
  onRopeCollision(rope: AABB): void {
    if (!Physics.isColliding(this, rope)) return;
    this.onRope = true;
    this.vy = 0; // Stop vertical movement

    const input = (this.constructor as any)._lastInput;
    if (input?.isClimbingUp()) {
      this.vy = -this.moveSpeed;
    } else if (input?.isClimbingDown()) {
      this.vy = this.moveSpeed;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw player as a simple rectangle with a circle head
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(this.x, this.y + 15, this.width, this.height - 15);

    ctx.fillStyle = '#FFB84D';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 8, this.y + 6, 4, 4);
    ctx.fillRect(this.x + 18, this.y + 6, 4, 4);
  }

  isGroundedNow(): boolean {
    return this.isGrounded;
  }
}
