/**
 * Entry Point
 * Initializes the game when the page loads
 */

import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-canvas');
  console.log('🎮 Platformer Portfolio Started!');
});
