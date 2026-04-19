/**
 * Rope Entity
 * Allows player to climb vertically
 */
import { AABB } from '../core/Physics';
export declare class Rope implements AABB {
    private static readonly spriteSrc;
    private static spriteImage;
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, height: number, width?: number);
    render(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Rope.d.ts.map