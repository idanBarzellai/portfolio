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
export declare class Physics {
    static readonly GRAVITY = 0.6;
    static readonly TERMINAL_VELOCITY = 15;
    /**
     * Check if two AABBs collide
     */
    static isColliding(a: AABB, b: AABB): boolean;
    /**
     * Get the collision side (for better resolution)
     * Returns: 'top', 'bottom', 'left', 'right', or null
     */
    static getCollisionSide(movingObj: AABB & {
        vx?: number;
        vy?: number;
    }, staticObj: AABB): string | null;
    /**
     * Apply gravity to an object
     */
    static applyGravity(velocity: {
        vy: number;
    }): void;
    /**
     * Resolve collision by adjusting position
     */
    static resolveCollision(movingObj: AABB & {
        vx?: number;
        vy?: number;
    }, staticObj: AABB, side: string): void;
}
//# sourceMappingURL=Physics.d.ts.map