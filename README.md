# Portfolio Hub

A mobile-first portfolio that works like a directional hub:

- Center: About
- Right: Projects (reels style)
- Left: Work Experience
- Down: Academic Experience
- Up: Skills

## Project files

- index.html (main page)
- src/app.js (JavaScript logic + content data)
- src/styles.css (styling)

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
http://127.0.0.1:5173/index.html
```

## What to edit

Open src/app.js and update:

- SECTION_LAYOUT: change section positions using x/y coordinates
- SECTION_CONTENT: change text for About, Work, Academic, Skills
- src/projects.json: add or edit project entries

Projects are now loaded from [src/projects.json](src/projects.json), so you can add or edit items there with:

- name
- mediaType (`image` or `gif` or `video`)
- media (image, gif, or video URL)
- description
- link

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
