export const SECTION_LAYOUT = {
  about: { x: 0, y: 0, title: "About" },
  projects: { x: 1, y: 0, title: "Projects" },
  work: { x: -1, y: 0, title: "Work Experience" },
  academic: { x: 0, y: 1, title: "Academic Experience" },
  skills: { x: 0, y: -1, title: "Skills" },
};

export const SECTION_CONTENT = {
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

export const PROJECT_REELS = [
  {
    title: "Project One",
    summary: "A short one-line summary of what the project does and why it matters.",
    mediaUrl: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=900&q=80",
    mediaType: "image",
    link: "https://example.com/project-one",
  },
  {
    title: "Project Two",
    summary: "Describe your stack and one concrete user or business outcome.",
    mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    mediaType: "image",
    link: "https://example.com/project-two",
  },
  {
    title: "Project Three",
    summary: "Add a demo video link or keep this as an image-based preview.",
    mediaUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=80",
    mediaType: "image",
    link: "https://example.com/project-three",
  },
];
