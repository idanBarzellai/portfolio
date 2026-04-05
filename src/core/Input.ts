/**
 * Input Handler
 * Manages keyboard input for the player
 */

export class Input {
  private keysPressed: Set<string> = new Set();

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
    return this.isKeyPressed('arrowleft') || this.isKeyPressed('a');
  }

  isMovingRight(): boolean {
    return this.isKeyPressed('arrowright') || this.isKeyPressed('d');
  }

  isJumping(): boolean {
    return this.isKeyPressed('arrowup') || this.isKeyPressed('w');
  }

  isClimbingUp(): boolean {
    return this.isKeyPressed('arrowup') || this.isKeyPressed('w');
  }

  isClimbingDown(): boolean {
    return this.isKeyPressed('arrowdown') || this.isKeyPressed('s');
  }
}
