/**
 * Physics
 * Handles collision detection and physics calculations
 */

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Physics {
  static readonly GRAVITY = 0.6;
  static readonly TERMINAL_VELOCITY = 15;

  /**
   * Check if two AABBs collide
   */
  static isColliding(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Get the collision side (for better resolution)
   * Returns: 'top', 'bottom', 'left', 'right', or null
   */
  static getCollisionSide(
    movingObj: AABB & { vx?: number; vy?: number },
    staticObj: AABB
  ): string | null {
    const overlapLeft = movingObj.x + movingObj.width - staticObj.x;
    const overlapRight = staticObj.x + staticObj.width - movingObj.x;
    const overlapTop = movingObj.y + movingObj.height - staticObj.y;
    const overlapBottom = staticObj.y + staticObj.height - movingObj.y;

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapTop && (movingObj.vy || 0) > 0) return 'top';
    if (minOverlap === overlapBottom && (movingObj.vy || 0) < 0) return 'bottom';
    if (minOverlap === overlapLeft && (movingObj.vx || 0) > 0) return 'left';
    if (minOverlap === overlapRight && (movingObj.vx || 0) < 0) return 'right';

    return null;
  }

  /**
   * Apply gravity to an object
   */
  static applyGravity(velocity: { vy: number }): void {
    velocity.vy += Physics.GRAVITY;
    if (velocity.vy > Physics.TERMINAL_VELOCITY) {
      velocity.vy = Physics.TERMINAL_VELOCITY;
    }
  }

  /**
   * Resolve collision by adjusting position
   */
  static resolveCollision(
    movingObj: AABB & { vx?: number; vy?: number },
    staticObj: AABB,
    side: string
  ): void {
    switch (side) {
      case 'top': // Player landing on platform (from above)
        movingObj.y = staticObj.y - movingObj.height;
        movingObj.vy = 0;
        break;
      case 'bottom': // Hit head on platform (from below)
        movingObj.y = staticObj.y + staticObj.height;
        movingObj.vy = 0;
        break;
      case 'left': // Hit from left side
        movingObj.x = staticObj.x - movingObj.width;
        movingObj.vx = 0;
        break;
      case 'right': // Hit from right side
        movingObj.x = staticObj.x + staticObj.width;
        movingObj.vx = 0;
        break;
    }
  }
}
