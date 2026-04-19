# Portfolio Hub (Swipe First)

A mobile-first portfolio that works like a directional hub:

- Center: About
- Right: Projects (reels style)
- Left: Work Experience
- Down: Academic Experience
- Up: Skills

## How to run

Because this app uses ES modules, run it with a local server (not by opening the file directly).

Option 1 (Node):

```bash
npx serve .
```

Option 2 (Python):

```bash
python -m http.server 8080
```

Then open the shown local URL.

## Modular section positions

Edit section coordinates in `src/config.js` under `SECTION_LAYOUT`.

Each section has an `(x, y)` coordinate:

- `(0, 0)` is the hub center (About)
- `x + 1` is right
- `x - 1` is left
- `y + 1` is down
- `y - 1` is up

You can move sections by changing coordinates only. Navigation updates automatically.

## Content editing

- Text sections: edit `SECTION_CONTENT` in `src/config.js`
- Projects reels: edit `PROJECT_REELS` in `src/config.js`
  - Use `mediaType: "image"` or `mediaType: "video"`
  - Set `mediaUrl` to your image/video URL
  - Set `link` to your project page

## Controls

- Mobile: swipe
- Desktop: arrow keys or on-screen direction buttons

In Projects, vertical swipe is used for reel scrolling. Horizontal swipe can still move between sections.
