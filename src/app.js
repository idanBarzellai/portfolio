import { PROJECT_REELS, SECTION_CONTENT, SECTION_LAYOUT } from "./config.js";

const host = document.getElementById("section-host");
const titleEl = document.getElementById("section-title");
const hintButtons = Array.from(document.querySelectorAll(".hint-btn"));

const SWIPE_MIN_DISTANCE = 40;

const directionVectors = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

let activeSectionId = "about";
let touchStart = null;

const coordinateMap = new Map(
  Object.entries(SECTION_LAYOUT).map(([sectionId, config]) => [
    `${config.x}:${config.y}`,
    sectionId,
  ])
);

function getNeighbor(sectionId, direction) {
  const current = SECTION_LAYOUT[sectionId];
  if (!current) return null;

  const vector = directionVectors[direction];
  const key = `${current.x + vector.x}:${current.y + vector.y}`;
  return coordinateMap.get(key) || null;
}

function renderTextSection(sectionId) {
  const content = SECTION_CONTENT[sectionId];
  const card = document.createElement("section");
  card.className = "text-section section-card";

  card.innerHTML = `
    <h2>${content.heading}</h2>
    <p>${content.body}</p>
  `;

  return card;
}

function buildProjectMedia(item) {
  if (item.mediaType === "video") {
    return `
      <video class="reel-media" src="${item.mediaUrl}" controls playsinline preload="metadata"></video>
    `;
  }

  return `
    <img class="reel-media" src="${item.mediaUrl}" alt="${item.title} preview" loading="lazy" />
  `;
}

function renderProjectsSection() {
  const wrapper = document.createElement("section");
  wrapper.className = "projects-section section-card";

  const reelHtml = PROJECT_REELS.map(
    (item) => `
      <article class="reel-item">
        ${buildProjectMedia(item)}
        <div class="reel-overlay">
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">Open project</a>
        </div>
      </article>
    `
  ).join("");

  wrapper.innerHTML = `
    <div class="reels" aria-label="Project reels" tabindex="0">
      ${reelHtml}
    </div>
  `;

  return wrapper;
}

function updateHints() {
  for (const button of hintButtons) {
    const dir = button.dataset.dir;
    const neighbor = getNeighbor(activeSectionId, dir);
    button.disabled = !neighbor;
  }
}

function renderActiveSection() {
  const current = SECTION_LAYOUT[activeSectionId];
  titleEl.textContent = current.title;
  host.classList.add("is-transitioning");

  window.setTimeout(() => {
    host.innerHTML = "";

    if (activeSectionId === "projects") {
      host.appendChild(renderProjectsSection());
    } else {
      host.appendChild(renderTextSection(activeSectionId));
    }

    host.classList.remove("is-transitioning");
    updateHints();
  }, 130);
}

function move(direction) {
  const nextSection = getNeighbor(activeSectionId, direction);
  if (!nextSection) return;

  activeSectionId = nextSection;
  renderActiveSection();
}

function shouldUseGlobalSwipe(direction, absX, absY) {
  if (activeSectionId !== "projects") return true;

  // In reels view, reserve strong vertical swipes for reel scrolling.
  if (direction === "up" || direction === "down") {
    return absX > absY;
  }

  return true;
}

function onTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}

function onTouchEnd(event) {
  if (!touchStart) return;

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStart.x;
  const deltaY = touch.clientY - touchStart.y;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  touchStart = null;

  if (Math.max(absX, absY) < SWIPE_MIN_DISTANCE) return;

  const isHorizontal = absX > absY;
  const direction = isHorizontal
    ? deltaX > 0
      ? "right"
      : "left"
    : deltaY > 0
      ? "down"
      : "up";

  if (!shouldUseGlobalSwipe(direction, absX, absY)) return;
  move(direction);
}

function onKeyDown(event) {
  const mapping = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  const direction = mapping[event.key];
  if (!direction) return;

  event.preventDefault();
  move(direction);
}

function bindEvents() {
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("keydown", onKeyDown);

  hintButtons.forEach((button) => {
    button.addEventListener("click", () => move(button.dataset.dir));
  });
}

bindEvents();
renderActiveSection();
