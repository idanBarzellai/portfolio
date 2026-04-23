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
let activeProjectIndex = 0;
let projectTransitionDirection = 1;
let projectAutoAdvanceTimer = null;
const PROJECT_AUTO_ADVANCE_MS = 5500;

const host = document.getElementById("section-host");
const titleEl = document.getElementById("section-title");
const headerHomeButton = document.getElementById("header-home-btn");
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
      <video class="reel-media reel-media--video" src="${item.media}" autoplay loop muted playsinline preload="metadata"></video>
    `;
  }

  return `
    <img class="reel-media" src="${item.media}" alt="${item.name} preview" loading="lazy" />
  `;
}

function getActiveProject() {
  if (projectReels.length === 0) return null;
  return projectReels[activeProjectIndex % projectReels.length];
}

function normalizeProjectMedia(project) {
  if (Array.isArray(project.mediaItems) && project.mediaItems.length > 0) {
    return project.mediaItems.map((item) => ({
      media: item.media ?? item.src ?? "",
      mediaType: item.mediaType ?? item.type ?? "image",
    }));
  }

  if (Array.isArray(project.media) && project.media.length > 0) {
    return project.media.map((item) => {
      if (typeof item === "string") {
        return { media: item, mediaType: project.mediaType ?? "image" };
      }

      return {
        media: item.media ?? item.src ?? "",
        mediaType: item.mediaType ?? item.type ?? project.mediaType ?? "image",
      };
    });
  }

  return [
    {
      media: project.media ?? "",
      mediaType: project.mediaType ?? "image",
    },
  ];
}

function getActiveProjectMedia(project) {
  if (!project || !Array.isArray(project.mediaItems) || project.mediaItems.length === 0) {
    return null;
  }

  const mediaIndex = project.activeMediaIndex ?? 0;
  return project.mediaItems[mediaIndex % project.mediaItems.length];
}

function renderProjectMediaPager(project) {
  if (!project || !Array.isArray(project.mediaItems) || project.mediaItems.length < 2) {
    return "";
  }

  return `
    <div class="project-media-pager" data-project-media-pager>
      ${project.mediaItems
        .map(
          (_, index) => `<button type="button" class="project-media-dot${index === (project.activeMediaIndex ?? 0) ? " is-active" : ""}" data-project-media-index="${index}" aria-label="Show media ${index + 1}"></button>`
        )
        .join("")}
    </div>
  `;
}

function renderProjectTimer() {
  return `
    <div class="project-timer" aria-hidden="true">
      <span class="project-timer-fill"></span>
    </div>
  `;
}

function renderProjectCard(item, direction = 1) {
  const animationClass = direction >= 0 ? "project-card--enter-next" : "project-card--enter-prev";
  const activeMedia = getActiveProjectMedia(item) ?? { media: item.media, mediaType: item.mediaType };
  const hasMultipleMedia = Array.isArray(item.mediaItems) && item.mediaItems.length > 1;
  return `
    <article class="project-card ${animationClass}" data-project-card tabindex="0" role="button" aria-label="${hasMultipleMedia ? "Tap to change project media" : "Project preview"}">
      ${renderProjectTimer()}
      ${buildProjectMedia(activeMedia)}
      <div class="reel-overlay">
        <div class="reel-copy">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <div class="reel-actions">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">Open project</a>
        </div>
      </div>
      ${renderProjectMediaPager(item)}
    </article>
  `;
}

function renderProjectsSection() {
  const wrapper = document.createElement("section");
  wrapper.className = "projects-section section-card";

  const activeProject = getActiveProject();
  const projectCount = projectReels.length;
  const projectIndicators = projectReels
    .map(
      (_, index) => `<button type="button" class="project-dot${index === activeProjectIndex ? " is-active" : ""}" data-project-index="${index}" aria-label="Go to project ${index + 1}"></button>`
    )
    .join("");

  wrapper.innerHTML = `
    <div class="project-controls">
      <button type="button" class="carousel-btn" data-project-dir="prev" aria-label="Previous project">↑</button>
      <div class="project-counter" data-project-counter>${activeProjectIndex + 1} / ${projectCount}</div>
      <button type="button" class="carousel-btn" data-project-dir="next" aria-label="Next project">↓</button>
    </div>
    <div class="project-progress" data-project-progress>
      ${projectIndicators}
    </div>
    <div class="project-stage" data-project-stage aria-label="Project reel">
      ${activeProject ? renderProjectCard(activeProject, projectTransitionDirection) : ""}
    </div>
  `;

  return wrapper;
}

function resetProjectAutoAdvanceTimer() {
  if (projectAutoAdvanceTimer) {
    window.clearTimeout(projectAutoAdvanceTimer);
  }

  if (activeSectionId !== "projects" || projectReels.length < 2) {
    projectAutoAdvanceTimer = null;
    return;
  }

  projectAutoAdvanceTimer = window.setTimeout(() => {
    if (activeSectionId !== "projects") return;
    moveProject(1);
    resetProjectAutoAdvanceTimer();
  }, PROJECT_AUTO_ADVANCE_MS);
}

function stopProjectAutoAdvanceTimer() {
  if (projectAutoAdvanceTimer) {
    window.clearTimeout(projectAutoAdvanceTimer);
    projectAutoAdvanceTimer = null;
  }
}

function updateProjectView() {
  const projectStage = host.querySelector("[data-project-stage]");
  const projectCounter = host.querySelector("[data-project-counter]");
  const projectProgress = host.querySelector("[data-project-progress]");
  const activeProject = getActiveProject();

  if (projectStage && activeProject) {
    projectStage.innerHTML = renderProjectCard(activeProject, projectTransitionDirection);

    const projectCard = projectStage.querySelector("[data-project-card]");
    if (projectCard) {
      projectCard.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;

        if (!activeProject.mediaItems || activeProject.mediaItems.length < 2) return;

        activeProject.activeMediaIndex = ((activeProject.activeMediaIndex ?? 0) + 1) % activeProject.mediaItems.length;
        updateProjectView();
        resetProjectAutoAdvanceTimer();
      });

      projectCard.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        if (!activeProject.mediaItems || activeProject.mediaItems.length < 2) return;

        event.preventDefault();
        activeProject.activeMediaIndex = ((activeProject.activeMediaIndex ?? 0) + 1) % activeProject.mediaItems.length;
        updateProjectView();
        resetProjectAutoAdvanceTimer();
      });
    }
  }

  if (projectCounter) {
    projectCounter.textContent = `${activeProjectIndex + 1} / ${projectReels.length}`;
  }

  if (projectProgress) {
    projectProgress.innerHTML = projectReels
      .map(
        (_, index) => `<button type="button" class="project-dot${index === activeProjectIndex ? " is-active" : ""}" data-project-index="${index}" aria-label="Go to project ${index + 1}"></button>`
      )
      .join("");

    projectProgress.querySelectorAll("[data-project-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.projectIndex);
        if (Number.isNaN(index)) return;
        projectTransitionDirection = index >= activeProjectIndex ? 1 : -1;
        activeProjectIndex = index;
        updateProjectView();
        resetProjectAutoAdvanceTimer();
      });
    });
  }
}

function moveProject(step) {
  if (projectReels.length === 0) return;

  projectTransitionDirection = step;
  activeProjectIndex = (activeProjectIndex + step + projectReels.length) % projectReels.length;
  updateProjectView();
  resetProjectAutoAdvanceTimer();
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
      mediaType: project.mediaType === "video" ? "video" : project.mediaType === "gif" ? "gif" : "image",
      description: project.description ?? "",
      link: project.link ?? "#",
      mediaItems: normalizeProjectMedia(project),
      activeMediaIndex: 0,
    }));

    activeProjectIndex = Math.min(activeProjectIndex, projectReels.length - 1);

    if (activeSectionId === "projects") {
      renderActiveSection();
    }
  } catch (error) {
    projectReels = DEFAULT_PROJECT_REELS.map((project) => ({
      ...project,
      mediaItems: normalizeProjectMedia(project),
      activeMediaIndex: 0,
    }));
  }
}

function bindSectionActions() {
  if (activeSectionId !== "projects") return;

  const controls = host.querySelectorAll("[data-project-dir]");

  controls.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.projectDir === "next" ? 1 : -1;
      moveProject(direction);
    });
  });

  const progressDots = host.querySelectorAll("[data-project-index]");
  progressDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.projectIndex);
      if (Number.isNaN(index)) return;

      projectTransitionDirection = index >= activeProjectIndex ? 1 : -1;
      activeProjectIndex = index;
      updateProjectView();
    });
  });
}

function updateHeaderHomeButton() {
  if (!headerHomeButton) return;
  headerHomeButton.classList.toggle("is-hidden", activeSectionId === "about");
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
  updateHeaderHomeButton();
  host.classList.add("is-transitioning");

  if (activeSectionId !== "projects") {
    stopProjectAutoAdvanceTimer();
  }

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

    if (activeSectionId === "projects") {
      resetProjectAutoAdvanceTimer();
    }
  }, 130);
}

function move(direction) {
  const nextSection = getNeighbor(activeSectionId, direction);
  if (!nextSection) return;

  if (nextSection === "projects" && activeSectionId !== "projects") {
    activeProjectIndex = 0;
  }

  activeSectionId = nextSection;
  renderActiveSection();
}

function shouldUseGlobalSwipe(direction, startedInProjects) {
  if (activeSectionId !== "projects") return true;

  if (!startedInProjects) return true;

  return direction === "left" || direction === "right";
}

function onTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStart = {
    x: touch.clientX,
    y: touch.clientY,
    startedInProjects: Boolean(event.target.closest(".projects-section")),
  };
}

function onTouchEnd(event) {
  if (!touchStart) return;

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStart.x;
  const deltaY = touch.clientY - touchStart.y;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const startedInProjects = touchStart.startedInProjects;

  touchStart = null;

  if (Math.max(absX, absY) < SWIPE_MIN_DISTANCE) return;

  const isHorizontal = absX > absY;
  const direction = isHorizontal ? (deltaX > 0 ? "right" : "left") : (deltaY > 0 ? "down" : "up");

  if (activeSectionId === "projects" && startedInProjects && !isHorizontal) {
    moveProject(deltaY < 0 ? 1 : -1);
    return;
  }

  if (activeSectionId === "projects" && startedInProjects && isHorizontal) {
    moveProject(deltaX > 0 ? -1 : 1);
    return;
  }

  if (!shouldUseGlobalSwipe(direction, startedInProjects)) return;
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

  if (activeSectionId === "projects" && (direction === "up" || direction === "down")) {
    moveProject(direction === "up" ? -1 : 1);
    return;
  }

  move(direction);
}

function bindEvents() {
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("keydown", onKeyDown);

  if (headerHomeButton) {
    headerHomeButton.addEventListener("click", () => {
      activeSectionId = "about";
      renderActiveSection();
    });
  }

  hintButtons.forEach((button) => {
    button.addEventListener("click", () => move(button.dataset.dir));
  });
}

bindEvents();
loadProjectsFromJson();
renderActiveSection();
