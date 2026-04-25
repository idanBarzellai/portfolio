const SECTION_LAYOUT = {
  about: { x: 0, y: 0, title: "About" },
  projects: { x: 1, y: 0, title: "Projects" },
  work: { x: -1, y: 0, title: "Work Experience" },
  academic: { x: 0, y: 1, title: "Academic Experience" },
  skills: { x: 0, y: -1, title: "Skills" },
};

let SECTION_CONTENT = {
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

const SECTION_JSON_FILES = {
  about: "about.json",
  skills: "skills.json",
  academic: "academic.json",
  work: "work-experience.json",
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
const PROJECT_AUTO_ADVANCE_MS = 30000;
const preloadedMediaSources = new Set();

const host = document.getElementById("section-host");
const titleEl = document.getElementById("section-title");
const headerHomeButton = document.getElementById("header-home-btn");
const hintBar = document.querySelector(".hint-bar");
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatSectionLabel(key) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderTextSection(sectionId) {
  const content = SECTION_CONTENT[sectionId];
  const card = document.createElement("section");
  card.className = "text-section section-card";

  if (sectionId === "about" && content && !Array.isArray(content) && typeof content === "object") {
    const name = content.name ?? content.heading ?? "";
    const title = content.title ?? "";
    const summary = content.summary ?? content.body ?? "";
    const phone = content.contact?.phone ?? "";
    const email = content.contact?.email ?? "";

    card.innerHTML = `
      <h2>${escapeHtml(name)}</h2>
      ${title ? `<p class="section-subtitle">${escapeHtml(title)}</p>` : ""}
      ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
      ${phone || email ? `<div class="section-contact">${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}</div>` : ""}
    `;

    return card;
  }

  if ((sectionId === "work" || sectionId === "academic") && Array.isArray(content)) {
    const heading = SECTION_LAYOUT[sectionId]?.title ?? "Experience";
    const entries = content
      .map((item) => {
        const title = item.title ?? item.degree ?? "";
        const org = item.company ?? item.institution ?? "";
        const years = item.years ?? "";
        const bullets = Array.isArray(item.description) ? item.description : [];

        return `
          <article class="section-entry">
            <h3>${escapeHtml(title)}</h3>
            <p class="section-entry-meta">${escapeHtml(org)}${org && years ? " | " : ""}${escapeHtml(years)}</p>
            ${bullets.length > 0 ? `<ul class="section-list">${bullets.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>` : ""}
          </article>
        `;
      })
      .join("");

    card.innerHTML = `
      <h2>${escapeHtml(heading)}</h2>
      <div class="section-stack">${entries}</div>
    `;

    return card;
  }

  if (sectionId === "skills" && content && !Array.isArray(content) && typeof content === "object") {
    const groups = Object.entries(content)
      .map(([groupKey, value]) => {
        const groupTitle = formatSectionLabel(groupKey);
        if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
          return `
            <section class="section-entry">
              <h3>${escapeHtml(groupTitle)}</h3>
              <ul class="skill-chip-list">${value.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}</ul>
            </section>
          `;
        }

        if (Array.isArray(value) && value.every((item) => item && typeof item === "object")) {
          return `
            <section class="section-entry">
              <h3>${escapeHtml(groupTitle)}</h3>
              <ul class="section-list">
                ${value
                  .map((item) => {
                    const name = item.language ?? item.name ?? "";
                    const level = item.level ?? "";
                    return `<li>${escapeHtml(name)}${level ? ` - ${escapeHtml(level)}` : ""}</li>`;
                  })
                  .join("")}
              </ul>
            </section>
          `;
        }

        return "";
      })
      .join("");

    card.innerHTML = `
      <h2>Skills</h2>
      <div class="section-stack">${groups}</div>
    `;

    return card;
  }

  card.innerHTML = `
    <h2>${escapeHtml(content?.heading ?? SECTION_LAYOUT[sectionId]?.title ?? "")}</h2>
    <p>${escapeHtml(content?.body ?? "")}</p>
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
    <img class="reel-media" src="${item.media}" alt="${item.name} preview" loading="eager" decoding="async" />
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

function isImageOnlyProjectGallery(project) {
  return (
    Boolean(project) &&
    Array.isArray(project.mediaItems) &&
    project.mediaItems.length > 1 &&
    project.mediaItems.every((item) => item.mediaType === "image")
  );
}

function getProjectStepDurationMs(project) {
  if (!isImageOnlyProjectGallery(project)) {
    return PROJECT_AUTO_ADVANCE_MS;
  }

  return Math.max(1000, Math.floor(PROJECT_AUTO_ADVANCE_MS / project.mediaItems.length));
}

function renderProjectTimer(project) {
  const durationMs = getProjectStepDurationMs(project);
  return `
    <div class="project-timer" aria-hidden="true">
      <span class="project-timer-fill" style="--project-timer-duration: ${durationMs}ms;"></span>
    </div>
  `;
}

function renderProjectCard(item, direction = 1) {
  const animationClass = direction > 0 ? "project-card--enter-next" : direction < 0 ? "project-card--enter-prev" : "";
  const activeMedia = getActiveProjectMedia(item) ?? { media: item.media, mediaType: item.mediaType };
  const hasProjectLink = typeof item.link === "string" && item.link.trim() !== "" && item.link.trim() !== "#";

  return `
    <article class="project-card${animationClass ? ` ${animationClass}` : ""}" data-project-card aria-label="Project preview">
      ${renderProjectTimer(item)}
      ${buildProjectMedia(activeMedia)}
      <div class="reel-overlay">
        <div class="reel-copy">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <div class="reel-actions">
          ${hasProjectLink ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer">Open project</a>` : ""}
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
  const projectIndicators = projectReels
    .map(
      (_, index) => `<button type="button" class="project-dot${index === activeProjectIndex ? " is-active" : ""}" data-project-index="${index}" aria-label="Go to project ${index + 1}"></button>`
    )
    .join("");

  wrapper.innerHTML = `
    <div class="project-stage" data-project-stage aria-label="Project reel">
      ${activeProject ? renderProjectCard(activeProject, projectTransitionDirection) : ""}
    </div>
    <div class="project-progress" data-project-progress>
      ${projectIndicators}
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

  const activeProject = getActiveProject();
  const durationMs = getProjectStepDurationMs(activeProject);

  projectAutoAdvanceTimer = window.setTimeout(() => {
    if (activeSectionId !== "projects") return;

    const currentProject = getActiveProject();
    if (isImageOnlyProjectGallery(currentProject)) {
      const nextIndex = ((currentProject.activeMediaIndex ?? 0) + 1) % currentProject.mediaItems.length;
      currentProject.activeMediaIndex = nextIndex;

      if (nextIndex === 0) {
        moveProject(1);
        return;
      }

      projectTransitionDirection = 0;
      updateProjectView();
      resetProjectAutoAdvanceTimer();
      return;
    }

    moveProject(1);
  }, durationMs);
}

function stopProjectAutoAdvanceTimer() {
  if (projectAutoAdvanceTimer) {
    window.clearTimeout(projectAutoAdvanceTimer);
    projectAutoAdvanceTimer = null;
  }
}

function advanceProjectImageStep(project, advanceProjectOnWrap = false) {
  if (!isImageOnlyProjectGallery(project)) return;

  const nextIndex = ((project.activeMediaIndex ?? 0) + 1) % project.mediaItems.length;
  project.activeMediaIndex = nextIndex;

  if (advanceProjectOnWrap && nextIndex === 0) {
    moveProject(1);
    return;
  }

  projectTransitionDirection = 0;
  updateProjectView();
  resetProjectAutoAdvanceTimer();
}

function updateProjectView() {
  const projectStage = host.querySelector("[data-project-stage]");
  const projectProgress = host.querySelector("[data-project-progress]");
  const activeProject = getActiveProject();

  if (projectStage && activeProject) {
    projectStage.innerHTML = renderProjectCard(activeProject, projectTransitionDirection);

    const projectCard = projectStage.querySelector("[data-project-card]");
    if (projectCard) {
      projectCard.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;

        const currentProject = getActiveProject();
        if (!isImageOnlyProjectGallery(currentProject)) return;

        advanceProjectImageStep(currentProject);
      });
    }
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

function preloadProjectMediaSource(source, mediaType) {
  if (!source || mediaType === "video" || preloadedMediaSources.has(source)) {
    return Promise.resolve();
  }

  preloadedMediaSources.add(source);

  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.src = source;

    if (image.complete) {
      resolve();
      return;
    }

    image.onload = () => resolve();
    image.onerror = () => resolve();
  });
}

function preloadProjectReelMedia(reels) {
  const preloadJobs = [];

  reels.forEach((project) => {
    if (!Array.isArray(project.mediaItems)) return;

    project.mediaItems.forEach((item) => {
      preloadJobs.push(preloadProjectMediaSource(item.media, item.mediaType));
    });
  });

  return Promise.all(preloadJobs);
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
    void preloadProjectReelMedia(projectReels);

    if (activeSectionId === "projects") {
      renderActiveSection();
    }
  } catch (error) {
    projectReels = DEFAULT_PROJECT_REELS.map((project) => ({
      ...project,
      mediaItems: normalizeProjectMedia(project),
      activeMediaIndex: 0,
    }));

    void preloadProjectReelMedia(projectReels);
  }
}

async function loadSectionContentFromJson() {
  const entries = Object.entries(SECTION_JSON_FILES);

  await Promise.all(
    entries.map(async ([sectionId, fileName]) => {
      try {
        const response = await fetch(`./src/${fileName}`, { cache: "no-store" });
        if (!response.ok) return;

        const content = await response.json();
        if (!content) return;

        SECTION_CONTENT[sectionId] = content;
      } catch (error) {
        // Keep defaults when a section JSON file is missing or invalid.
      }
    })
  );
}

function bindSectionActions() {
  if (activeSectionId !== "projects") return;
}

function updateHeaderHomeButton() {
  if (!headerHomeButton) return;
  headerHomeButton.classList.toggle("is-hidden", activeSectionId === "about");
}

function updateHints() {
  if (hintBar) {
    hintBar.classList.toggle("is-hidden", activeSectionId !== "about");
  }

  for (const button of hintButtons) {
    const dir = button.dataset.dir;
    const neighbor = getNeighbor("about", dir);
    const labelEl = button.parentElement?.querySelector(".hint-label");
    const directionLabel = dir ? dir.charAt(0).toUpperCase() + dir.slice(1) : "";

    if (neighbor) {
      const sectionTitle = SECTION_LAYOUT[neighbor]?.title ?? "";
      button.setAttribute("aria-label", `Swipe ${dir} to ${sectionTitle}`);

      if (labelEl) {
        labelEl.textContent = sectionTitle;
      }
    } else {
      button.setAttribute("aria-label", directionLabel ? `Swipe ${directionLabel}` : "Swipe");
      if (labelEl) {
        labelEl.textContent = "";
      }
    }

    if (activeSectionId !== "about") {
      button.disabled = true;
      continue;
    }

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

function onTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}

function handleSwipeEnd(endX, endY) {
  if (!touchStart) return;

  const deltaX = endX - touchStart.x;
  const deltaY = endY - touchStart.y;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  touchStart = null;

  if (Math.max(absX, absY) < SWIPE_MIN_DISTANCE) return;

  const isHorizontal = absX > absY;
  const direction = isHorizontal ? (deltaX > 0 ? "right" : "left") : (deltaY > 0 ? "down" : "up");

  if (activeSectionId === "projects") {
    if (!isHorizontal) {
      moveProject(deltaY < 0 ? 1 : -1);
      return;
    }

    activeSectionId = "about";
    renderActiveSection();
    return;
  }

  if (activeSectionId !== "about") {
    activeSectionId = "about";
    renderActiveSection();
    return;
  }

  move(direction);
}

function onTouchEnd(event) {
  const touch = event.changedTouches[0];
  handleSwipeEnd(touch.clientX, touch.clientY);
}

function onMouseDown(event) {
  if (event.button !== 0) return;
  touchStart = { x: event.clientX, y: event.clientY };
}

function onMouseUp(event) {
  if (event.button !== 0) return;
  handleSwipeEnd(event.clientX, event.clientY);
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

  if (activeSectionId !== "about") {
    activeSectionId = "about";
    renderActiveSection();
    return;
  }

  if (activeSectionId === "projects" && (direction === "up" || direction === "down")) {
    moveProject(direction === "up" ? -1 : 1);
    return;
  }

  move(direction);
}

function bindEvents() {
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
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
Promise.all([loadProjectsFromJson(), loadSectionContentFromJson()]).finally(() => {
  renderActiveSection();
});
