# Idan's Game Designer Portfolio

A browser-based platformer game that doubles as a portfolio website. Navigate through a 2D game world to explore my game design work, projects, and experience.

## Features

- **2D Platformer Gameplay**: Move, jump, and climb through the game world
- **Interactive Sections**: Each platform leads to a different portfolio section
- **Responsive Controls**: Smooth keyboard-based player movement
- **Physics Engine**: Gravity, collision detection, and velocity-based movement

## Tech Stack

- **TypeScript** for type-safe development
- **HTML5 Canvas** for rendering
- **Webpack** for bundling
- **CSS3** for styling

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts a development server at `http://localhost:8080` with hot reloading.

### Build

```bash
npm run build
```

Generates production bundle in the `dist/` folder.

### Watch Mode

```bash
npm run watch
```

Watches for changes and rebuilds continuously.

## Controls

- **← →** or **A/D**: Move left/right
- **Space**: Jump
- **↑/↓** or **W/S**: Climb ropes
- Walk into platforms to view portfolio sections

## Project Structure

```
src/
├── core/
│   ├── Game.ts          # Main game loop
│   ├── Input.ts         # Keyboard input handling
│   └── Physics.ts       # Collision & physics system
├── entities/
│   ├── Player.ts        # Player character
│   ├── Platform.ts      # Solid platforms
│   ├── Rope.ts          # Climbable ropes
│   └── Portal.ts        # Interactive project portals (coming soon)
├── ui/
│   ├── Modal.ts         # Modal system (coming soon)
│   └── SectionPanel.ts  # Portfolio section display (coming soon)
├── data/
│   └── portfolioData.ts # Portfolio content
└── index.ts             # Entry point
```

## Roadmap

- [x] Basic game engine with movement & gravity
- [x] Collision detection & resolution
- [x] Simple level with platforms
- [ ] Rope climbing mechanic
- [ ] Section triggers & panels
- [ ] Portal system
- [ ] Modal/dialog system
- [ ] Smooth animations & transitions
- [ ] Mobile controls
- [ ] Audio & SFX

## Author

Idan Barzellai - Game Designer & Developer
