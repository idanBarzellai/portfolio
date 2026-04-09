/**
 * Player Entity
 * Represents the player character in the game world
 */

import { Physics, AABB } from '../core/Physics';
import { Input } from '../core/Input';
import { gameConfig } from '../data/gameConfig';

type PlayerAnimState = 'idle' | 'walk' | 'jump' | 'climb';

export class Player implements AABB {
  x: number;
  y: number;
  width: number = gameConfig.player.width;
  height: number = gameConfig.player.height;

  vx: number = 0; // Velocity X
  vy: number = 0; // Velocity Y

  private moveSpeed: number = 4.5;
  private jumpPower: number = 10.5;
  private climbSpeed: number = 3;
  private isGrounded: boolean = false;
  private canJump: boolean = true;
  private onLadder: boolean = false;
  private facing: 'left' | 'right' = 'right';
  private currentAnim: PlayerAnimState = 'idle';
  private animFrame: number = 0;
  private animCounter: number = 0;
  private spriteImages: Partial<Record<PlayerAnimState, HTMLImageElement>> = {};

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.preloadSprites();
  }

  private preloadSprites(): void {
    const sprites = gameConfig.player.sprites;
    const states: PlayerAnimState[] = ['idle', 'walk', 'jump', 'climb'];

    for (const state of states) {
      const src = sprites[state].src;
      if (!src) {
        continue;
      }

      const image = new Image();
      image.src = src;
      this.spriteImages[state] = image;
    }
  }

  private resolveAnimationState(): PlayerAnimState {
    if (this.onLadder && Math.abs(this.vy) > 0.1) {
      return 'climb';
    }
    if (!this.isGrounded) {
      return 'jump';
    }
    if (Math.abs(this.vx) > 0.1) {
      return 'walk';
    }
    return 'idle';
  }

  private tickAnimation(state: PlayerAnimState): void {
    const sprite = gameConfig.player.sprites[state];
    const frameAdvanceEvery = Math.max(1, Math.round(60 / Math.max(1, sprite.fps)));

    if (state !== this.currentAnim) {
      this.currentAnim = state;
      this.animFrame = 0;
      this.animCounter = 0;
      return;
    }

    this.animCounter += 1;
    if (this.animCounter >= frameAdvanceEvery) {
      this.animCounter = 0;
      this.animFrame = (this.animFrame + 1) % Math.max(1, sprite.frames);
    }
  }

  update(input: Input, touchingLadder: boolean): void {
    // Horizontal movement
    this.vx = 0;
    if (input.isMovingLeft()) {
      this.vx = -this.moveSpeed;
      this.facing = 'left';
    }
    if (input.isMovingRight()) {
      this.vx = this.moveSpeed;
      this.facing = 'right';
    }

    if (!touchingLadder) {
      this.onLadder = false;
    } else {
      const holdLadder = input.isClimbingUp() || (this.onLadder && input.isClimbingDown());
      this.onLadder = holdLadder;
    }

    // Jumping
    if (input.isJumping() && this.isGrounded && this.canJump) {
      this.vy = -this.jumpPower;
      this.isGrounded = false;
      this.canJump = false;
    } else if (!input.isJumping()) {
      this.canJump = true;
    }

    if (this.onLadder) {
      this.vy = 0;
      if (input.isClimbingUp()) {
        this.vy = -this.climbSpeed;
      } else if (input.isClimbingDown()) {
        this.vy = this.climbSpeed;
      }
    } else {
      Physics.applyGravity(this);
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Reset grounded state
    this.isGrounded = false;
  }

  /**
   * Handle collision with a platform
   */
  collideWithPlatform(platform: AABB, allowPassThrough: boolean = false): boolean {
    if (!Physics.isColliding(this, platform)) return false;

    const side = Physics.getCollisionSide(this, platform);

    if (allowPassThrough && side === 'bottom') {
      return false;
    }

    if (side === 'top') {
      Physics.resolveCollision(this, platform, side);
      this.isGrounded = true;
    } else if (side) {
      Physics.resolveCollision(this, platform, side);
    }

    return true;
  }

  /**
   * Handle rope interaction
   */
  onRopeCollision(rope: AABB): void {
    if (!Physics.isColliding(this, rope)) return;
    this.onLadder = true;
    this.vy = 0; // Stop vertical movement

    const input = (this.constructor as any)._lastInput;
    if (input?.isClimbingUp()) {
      this.vy = -this.climbSpeed;
    } else if (input?.isClimbingDown()) {
      this.vy = this.climbSpeed;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const state = this.resolveAnimationState();
    this.tickAnimation(state);

    const image = this.spriteImages[state];
    const sprite = gameConfig.player.sprites[state];

    if (image && image.complete && image.naturalWidth > 0) {
      const sourceX = this.animFrame * sprite.frameWidth;

      ctx.save();
      if (this.facing === 'left') {
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
          image,
          sourceX,
          0,
          sprite.frameWidth,
          sprite.frameHeight,
          0,
          0,
          this.width,
          this.height
        );
      } else {
        ctx.drawImage(
          image,
          sourceX,
          0,
          sprite.frameWidth,
          sprite.frameHeight,
          this.x,
          this.y,
          this.width,
          this.height
        );
      }
      ctx.restore();
      return;
    }

    // Fallback player art when no sprite sheet is configured.
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(this.x, this.y + 15, this.width, this.height - 15);

    ctx.fillStyle = '#FFB84D';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    const eyeY = this.y + 6;
    if (this.facing === 'left') {
      ctx.fillRect(this.x + 7, eyeY, 4, 4);
      ctx.fillRect(this.x + 15, eyeY, 4, 4);
    } else {
      ctx.fillRect(this.x + 11, eyeY, 4, 4);
      ctx.fillRect(this.x + 19, eyeY, 4, 4);
    }
  }

  isGroundedNow(): boolean {
    return this.isGrounded;
  }

  isOnLadderNow(): boolean {
    return this.onLadder;
  }

  isWalkingOnGroundNow(): boolean {
    return this.isGrounded && Math.abs(this.vx) > 0.1;
  }

  setMoveSpeed(value: number): void {
    this.moveSpeed = Math.max(1, value);
  }

  getMoveSpeed(): number {
    return this.moveSpeed;
  }

  setJumpPower(value: number): void {
    this.jumpPower = Math.max(1, value);
  }

  getJumpPower(): number {
    return this.jumpPower;
  }

  setClimbSpeed(value: number): void {
    this.climbSpeed = Math.max(0.5, value);
  }

  getClimbSpeed(): number {
    return this.climbSpeed;
  }
}
