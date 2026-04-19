/**
 * Player Entity
 * Represents the player character in the game world
 */
import { AABB } from '../core/Physics';
import { Input } from '../core/Input';
export declare class Player implements AABB {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    private moveSpeed;
    private jumpPower;
    private climbSpeed;
    private isGrounded;
    private canJump;
    private onLadder;
    private facing;
    private currentAnim;
    private animFrame;
    private animCounter;
    private spriteImages;
    constructor(x: number, y: number);
    private preloadSprites;
    private resolveAnimationState;
    private tickAnimation;
    update(input: Input, touchingLadder: boolean): void;
    /**
     * Handle collision with a platform
     */
    collideWithPlatform(platform: AABB, allowPassThrough?: boolean): boolean;
    /**
     * Handle rope interaction
     */
    onRopeCollision(rope: AABB): void;
    render(ctx: CanvasRenderingContext2D): void;
    isGroundedNow(): boolean;
    isOnLadderNow(): boolean;
    isWalkingOnGroundNow(): boolean;
    setMoveSpeed(value: number): void;
    getMoveSpeed(): number;
    setJumpPower(value: number): void;
    getJumpPower(): number;
    setClimbSpeed(value: number): void;
    getClimbSpeed(): number;
}
//# sourceMappingURL=Player.d.ts.map