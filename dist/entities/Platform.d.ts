/**
 * Platform Entity
 * Represents solid platforms in the game world
 */
import { AABB } from '../core/Physics';
export interface PlatformData extends AABB {
    id: string;
    section?: string;
    sectionId?: string;
    color?: string;
    opacity?: number;
}
export declare class Platform implements AABB {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
    section?: string;
    sectionId?: string;
    color: string;
    opacity: number;
    constructor(data: PlatformData);
    render(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Platform.d.ts.map