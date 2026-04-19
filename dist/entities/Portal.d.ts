/**
 * Portal Entity
 * Interactive gateway to open a section's details
 */
import { AABB } from '../core/Physics';
export declare class Portal implements AABB {
    x: number;
    y: number;
    width: number;
    height: number;
    sectionId: string;
    label: string;
    constructor(x: number, y: number, sectionId: string, label: string);
    render(ctx: CanvasRenderingContext2D): void;
    renderHint(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Portal.d.ts.map