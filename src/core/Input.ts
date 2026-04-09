/**
 * Input Handler
 * Manages keyboard input for the player
 */

export class Input {
  private keysPressed: Set<string> = new Set();
  private virtualMoveX: number = 0;
  private virtualJump: boolean = false;
  private virtualClimbUp: boolean = false;
  private virtualClimbDown: boolean = false;

  constructor() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keysPressed.add(event.key.toLowerCase());
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key.toLowerCase());
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toLowerCase());
  }

  isMovingLeft(): boolean {
    return this.isKeyPressed('arrowleft') || this.isKeyPressed('a') || this.virtualMoveX < -0.25;
  }

  isMovingRight(): boolean {
    return this.isKeyPressed('arrowright') || this.isKeyPressed('d') || this.virtualMoveX > 0.25;
  }

  isJumping(): boolean {
    return this.isKeyPressed('arrowup') || this.isKeyPressed('w') || this.virtualJump;
  }

  isClimbingUp(): boolean {
    return this.isKeyPressed('arrowup') || this.isKeyPressed('w') || this.virtualClimbUp || this.virtualJump;
  }

  isClimbingDown(): boolean {
    return this.isKeyPressed('arrowdown') || this.isKeyPressed('s') || this.virtualClimbDown;
  }

  setVirtualMoveX(value: number): void {
    this.virtualMoveX = Math.max(-1, Math.min(1, value));
  }

  setVirtualJump(active: boolean): void {
    this.virtualJump = active;
  }

  setVirtualClimb(up: boolean, down: boolean): void {
    this.virtualClimbUp = up;
    this.virtualClimbDown = down;
  }
}
