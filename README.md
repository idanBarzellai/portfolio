# Portfolio Hub

Portfolio Hub is a swipe-first portfolio that works like a directional hub.

## Layout

- Center: About
- Right: Projects
- Left: Work Experience
- Down: Academic Experience
- Up: Skills

The app is JSON-driven, so most content lives in `src/*.json` files instead of being hardcoded in the UI.

## Project files

- index.html (main page)
- src/app.js (navigation, rendering, and interactions)
- src/styles.css (layout and styling)
- src/about.json (About section content)
- src/work-experience.json (work timeline)
- src/academic.json (academic timeline)
- src/skills.json (skills groups)
- src/projects.json (project reels)
- assets/ (logos, portraits, and project media)

## Run locally

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

## Editing content

Update the JSON files in `src/` to change the section content:

- `src/about.json`: name, title, summary, phone, email
- `src/work-experience.json`: jobs, companies, years, logos, bullets
- `src/academic.json`: education entries, years, logos, bullets
- `src/skills.json`: grouped skills and languages
- `src/projects.json`: project reels

Project items support:

- name
- mediaType (`image` or `gif` or `video`)
- media (image, gif, or video URL)
- description
- link

About supports a clickable phone number and email address, and the portrait image plays a small hi animation and bop sound when tapped.

## Controls

- Mobile: swipe between sections
- Desktop: arrow keys, on-screen direction buttons, and the project side arrows
- Projects: the dots switch projects, and horizontal swipes move through the reel

Coordinate rules:

- (0, 0) is center
- x + 1 is right
- x - 1 is left
- y + 1 is down
- y - 1 is up

## Notes

- `npm run dev` starts a local live server on port `5173`
- The home page is `index.html`
- In Projects, vertical swipe is reserved for reel scrolling while horizontal swipe still switches sections
