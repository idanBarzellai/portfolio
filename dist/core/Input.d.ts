/**
 * Input Handler
 * Manages keyboard input for the player
 */
export declare class Input {
    private keysPressed;
    private virtualMoveX;
    private virtualJump;
    private virtualClimbUp;
    private virtualClimbDown;
    constructor();
    private handleKeyDown;
    private handleKeyUp;
    isKeyPressed(key: string): boolean;
    isMovingLeft(): boolean;
    isMovingRight(): boolean;
    isJumping(): boolean;
    isClimbingUp(): boolean;
    isClimbingDown(): boolean;
    setVirtualMoveX(value: number): void;
    setVirtualJump(active: boolean): void;
    setVirtualClimb(up: boolean, down: boolean): void;
}
//# sourceMappingURL=Input.d.ts.map