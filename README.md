# Idan's Game Designer Portfolio

A browser platformer where the main world acts as a world-map hub and each portfolio domain is a dedicated themed scene.

## Core Vision

The portfolio should feel like a playable game, not a static page:

1. Main scene with labeled platforms and ladders.
2. A portal near each section platform.
3. Press Up near a portal to enter a dedicated scene.
4. Each scene visualizes portfolio information as world objects.
5. Exit portal returns to the main scene.

## Scene Design

### Main Scene (Hub)

- Side-scrolling platform layout with section labels above platforms.
- Ladders support Up/Down movement and allow climbing through platform undersides.
- Portals lead into thematic rooms.

### Projects Scene (Gallery Room)

- Gallery-style framed project cards.
- Each card shows title, summary, and tags.
- Represents all featured projects.

### Work Experience Scene (Factory)

- Factory floor with a conveyor-belt style composition.
- Each workplace/role appears as an object station on the assembly line.

### Academic Experience Scene (Library)

- Library-style shelves and reference cards.
- Each academic item appears as a book/reference section.

### Languages Scene (Plane Hangar)

- Plane/hangar themed composition.
- Programming languages shown as labels around the aircraft.

### Skills Scene (Blacksmith Workshop)

- Forge/workshop composition with weapon-like displays.
- Each weapon represents a key skill.

## Controls

- **Left/Right** or **A/D**: Move
- **Space**: Jump
- **Up/Down** or **W/S**: Climb ladders
- **Up near portal**: Enter scene
- **Up near Exit portal**: Return to main scene

## What Is Already Implemented

- [x] Main hub scene with labeled section platforms
- [x] Ladder climbing with upward platform pass-through behavior
- [x] Portal entry system using Up interaction
- [x] Dedicated scene rendering for:
	- [x] Projects gallery
	- [x] Work experience factory
	- [x] Academic experience library
	- [x] Languages plane hangar
	- [x] Skills blacksmith workshop
- [x] Exit portal back to main scene

## Tech Stack

- TypeScript
- HTML5 Canvas
- Webpack
- CSS

## Getting Started

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## Project Structure

```text
src/
	core/
		Game.ts
		Input.ts
		Physics.ts
	data/
		portfolioData.ts
	entities/
		Platform.ts
		Player.ts
		Portal.ts
		Rope.ts
	index.ts
```

## Next Enhancements

1. Add camera transitions and scene fade-in/out when entering portals.
2. Make project cards clickable in the Projects scene.
3. Add ambient audio per scene.
4. Add NPCs and interactive tooltips.

## Author

Idan Barzellai
