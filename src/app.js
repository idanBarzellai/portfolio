const SECTION_LAYOUT = {
  about: { x: 0, y: 0, title: "About" },
  projects: { x: 1, y: 0, title: "Projects" },
  work: { x: -1, y: 0, title: "Work Experience" },
  academic: { x: 0, y: 1, title: "Academic Experience" },
  skills: { x: 0, y: -1, title: "Skills" },
};

const SECTION_CONTENT = {
  about: {
    heading: "Hi, I'm Your Name",
    body: "I build thoughtful digital experiences with a strong focus on product quality, speed, and clear communication. This portfolio uses a directional hub: swipe around to explore.",
  },
  work: {
    heading: "Work Experience",
    body: "Share your professional timeline here: role, company, impact, and metrics. Keep it short and outcome-focused so it reads well on mobile.",
  },
  academic: {
    heading: "Academic Experience",
    body: "List your studies, key courses, thesis/project highlights, and any awards. Prioritize practical results and real-world relevance.",
  },
  skills: {
    heading: "Skills",
    body: "Group your skills by area, for example: Frontend, Backend, AI tools, UX, and collaboration. Mention tools you use confidently in production.",
  },
};

const DEFAULT_PROJECT_REELS = [
  {
    name: "Project One",
    media: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=900&q=80",
    mediaType: "image",
    description: "A short one-line summary of what the project does and why it matters.",
    link: "https://example.com/project-one",
  },
  {
    name: "Project Two",
    media: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    mediaType: "image",
    description: "Describe your stack and one concrete user or business outcome.",
    link: "https://example.com/project-two",
  },
  {
    name: "Project Three",
    media: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=80",
    mediaType: "image",
    description: "Add a demo video link or keep this as an image-based preview.",
    link: "https://example.com/project-three",
  },
];

let projectReels = [...DEFAULT_PROJECT_REELS];

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
  Object.entries(SECTION_LAYOUT).map(([sectionId, config]) => [`${config.x}:${config.y}`, sectionId])
);

const sectionEntries = Object.entries(SECTION_LAYOUT);

function getNeighbor(sectionId, direction) {
  const current = SECTION_LAYOUT[sectionId];
  if (!current) return null;

  const vector = directionVectors[direction];
  const key = `${current.x + vector.x}:${current.y + vector.y}`;
  const direct = coordinateMap.get(key);
  if (direct) return direct;

  // Wrap horizontally/vertically so section navigation behaves like a carousel.
  if (direction === "left" || direction === "right") {
    const row = sectionEntries
      .filter(([, cfg]) => cfg.y === current.y)
      .map(([id, cfg]) => ({ id, pos: cfg.x }))
      .sort((a, b) => a.pos - b.pos);

    if (row.length < 2) return null;
    const currentIndex = row.findIndex((item) => item.id === sectionId);
    if (currentIndex < 0) return null;
    const offset = direction === "right" ? 1 : -1;
    const nextIndex = (currentIndex + offset + row.length) % row.length;
    return row[nextIndex].id;
  }

  const column = sectionEntries
    .filter(([, cfg]) => cfg.x === current.x)
    .map(([id, cfg]) => ({ id, pos: cfg.y }))
    .sort((a, b) => a.pos - b.pos);

  if (column.length < 2) return null;
  const currentIndex = column.findIndex((item) => item.id === sectionId);
  if (currentIndex < 0) return null;
  const offset = direction === "down" ? 1 : -1;
  const nextIndex = (currentIndex + offset + column.length) % column.length;
  return column[nextIndex].id;
}

function renderHomeButton() {
  if (activeSectionId === "about") return "";
  return `<button type="button" class="home-btn" data-home="true">Home</button>`;
}

function renderTextSection(sectionId) {
  const content = SECTION_CONTENT[sectionId];
  const card = document.createElement("section");
  card.className = "text-section section-card";

  card.innerHTML = `
    ${renderHomeButton()}
    <h2>${content.heading}</h2>
    <p>${content.body}</p>
  `;

  return card;
}

function buildProjectMedia(item) {
  if (item.mediaType === "video") {
    return `
      <video class="reel-media" src="${item.media}" controls playsinline preload="metadata"></video>
    `;
  }

  return `
    <img class="reel-media" src="${item.media}" alt="${item.name} preview" loading="lazy" />
  `;
}

function renderProjectsSection() {
  const wrapper = document.createElement("section");
  wrapper.className = "projects-section section-card";

  const reelHtml = projectReels.map(
    (item) => `
      <article class="reel-item">
        ${buildProjectMedia(item)}
        <div class="reel-overlay">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">Open project</a>
        </div>
      </article>
    `
  ).join("");

  wrapper.innerHTML = `
    ${renderHomeButton()}
    <div class="project-controls">
      <button type="button" class="carousel-btn" data-carousel-dir="prev" aria-label="Previous project">←</button>
      <button type="button" class="carousel-btn" data-carousel-dir="next" aria-label="Next project">→</button>
    </div>
    <div class="reels" aria-label="Project carousel" tabindex="0">
      <div class="reels-track">
        ${reelHtml}
      </div>
    </div>
  `;

  return wrapper;
}

async function loadProjectsFromJson() {
  try {
    const response = await fetch("./src/projects.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.status}`);
    }

    const projects = await response.json();
    if (!Array.isArray(projects) || projects.length === 0) {
      throw new Error("Project JSON must contain a non-empty array.");
    }

    projectReels = projects.map((project) => ({
      name: project.name ?? "Untitled project",
      media: project.media,
      mediaType: project.mediaType === "video" ? "video" : "image",
      description: project.description ?? "",
      link: project.link ?? "#",
    }));

    if (activeSectionId === "projects") {
      renderActiveSection();
    }
  } catch (error) {
    projectReels = [...DEFAULT_PROJECT_REELS];
  }
}

function bindSectionActions() {
  const homeButton = host.querySelector("[data-home='true']");
  if (homeButton) {
    homeButton.addEventListener("click", () => {
      activeSectionId = "about";
      renderActiveSection();
    });
  }

  if (activeSectionId !== "projects") return;

  const reels = host.querySelector(".reels");
  if (!reels) return;
  const controls = host.querySelectorAll("[data-carousel-dir]");

  controls.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.carouselDir === "next" ? 1 : -1;
      reels.scrollBy({ left: reels.clientWidth * direction, behavior: "smooth" });
    });
  });
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

    bindSectionActions();
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

function shouldUseGlobalSwipe(direction, absX, absY, startedInReels) {
  if (activeSectionId !== "projects") return true;

  if (startedInReels) {
    return false;
  }

  return true;
}

function onTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStart = {
    x: touch.clientX,
    y: touch.clientY,
    startedInReels: Boolean(event.target.closest(".reels")),
  };
}

function onTouchEnd(event) {
  if (!touchStart) return;

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStart.x;
  const deltaY = touch.clientY - touchStart.y;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const startedInReels = touchStart.startedInReels;

  touchStart = null;

  if (Math.max(absX, absY) < SWIPE_MIN_DISTANCE) return;

  const isHorizontal = absX > absY;
  const direction = isHorizontal ? (deltaX > 0 ? "right" : "left") : (deltaY > 0 ? "down" : "up");

  if (!shouldUseGlobalSwipe(direction, absX, absY, startedInReels)) return;
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
loadProjectsFromJson();
renderActiveSection();
