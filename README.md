# Portfolio Hub

A mobile-first portfolio that works like a directional hub:

- Center: About
- Right: Projects (reels style)
- Left: Work Experience
- Down: Academic Experience
- Up: Skills

## Project files

- index.htm (main page)
- src/app.js (JavaScript logic + content data)
- src/styles.css (styling)

index.html is also included for compatibility, but npm dev opens index.htm.

## Run locally with Node

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Then open:

```text
http://127.0.0.1:5173/index.htm
```

## What to edit

Open src/app.js and update:

- SECTION_LAYOUT: change section positions using x/y coordinates
- SECTION_CONTENT: change text for About, Work, Academic, Skills
- PROJECT_REELS: add image/video reels and links

Coordinate rules:

- (0, 0) is center
- x + 1 is right
- x - 1 is left
- y + 1 is down
- y - 1 is up

## Controls

- Mobile: swipe
- Desktop: arrow keys or on-screen direction buttons

In Projects, vertical swipe is reserved for reel scrolling. Horizontal swipe still switches sections.
