/**
 * Portfolio Data
 * Contains sections and projects information
 */

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  tags: string[];
}

export interface SectionItemData {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface SectionData {
  id: string;
  title: string;
  content: string;
  roomTitle?: string;
  roomSubtitle?: string;
  backgroundImage?: string;
  items?: SectionItemData[];
  projects?: ProjectData[];
}

export let portfolioSections: SectionData[] = [
  {
    id: 'about',
    title: 'About',
    content: 'Game designer and developer focused on playful systems, prototyping, and polished player experiences.',
    roomTitle: 'About Me',
    roomSubtitle: 'A short overview of who I am and how I work.',
    items: [
      { id: 'about-1', title: 'Focus', description: 'Designing playable systems with strong player feedback.' },
      { id: 'about-2', title: 'Approach', description: 'Iterate quickly, test often, and refine the feel.' },
      { id: 'about-3', title: 'Strength', description: 'Bridging design intent with technical implementation.' },
    ],
  },
  {
    id: 'skills',
    title: 'Skills',
    content: 'Game Design & Production • Game Design • Game Creative • Gameplay Development • Team Leadership • Team Collaboration • Tools & Platforms • Unity • Phaser • Construct 2 & 3 • GitHub / Bitbucket • Jira / Monday.com • AWS S3 • Photoshop • Programming • JavaScript • TypeScript • C# • Java • Python',
    roomTitle: 'Blacksmith Workshop',
    roomSubtitle: 'Each weapon stand is a key skill set.',
    items: [
      { id: 'skill-1', title: 'Game Design', description: 'Category: Game Design & Production' },
      { id: 'skill-2', title: 'Game Creative', description: 'Category: Game Design & Production' },
      { id: 'skill-3', title: 'Gameplay Development', description: 'Category: Game Design & Production' },
      { id: 'skill-4', title: 'Team Leadership', description: 'Category: Game Design & Production' },
      { id: 'skill-5', title: 'Team Collaboration', description: 'Category: Game Design & Production' },
      { id: 'skill-6', title: 'Unity', description: 'Category: Tools & Platforms' },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    content: 'Featured projects from game design, prototyping, game jams, and production-focused coursework.',
    roomTitle: 'Projects Gallery',
    roomSubtitle: 'A room of playable and design-focused project frames.',
    projects: [
      {
        id: 'project-1',
        title: 'KERAH',
        description: 'A chilly cooperative challenge for two players!',
        image: 'assets/Projects/kerah.png',
        link: 'https://idanbarzellai.itch.io/kerah',
        tags: ['Co-op', 'Game Design'],
      },
      {
        id: 'project-2',
        title: 'Spelunky - The Board Game',
        description: 'A board game adaptation of the classic video game Spelunky.',
        image: 'assets/Projects/spelunky_the_board_game.png',
        link: 'https://idanbarzellai.itch.io/spelunky-the-board-game',
        tags: ['Board Game', 'Adaptation'],
      },
      {
        id: 'project-3',
        title: 'Fiddler Crab',
        description: 'An underwater arcade game where you smash shells, collect pearls, and grow stronger with every run.',
        image: 'assets/Projects/fiddler_crab.png',
        link: 'https://idanbarzellai.itch.io/fiddler-crab',
        tags: ['Arcade', 'Game Project'],
      },
      {
        id: 'project-4',
        title: 'Karakasa',
        description: 'Do you know the yokai tale of Karakasa-obake',
        image: 'assets/Projects/karakasa.png',
        link: 'https://idanbarzellai.itch.io/karakasa',
        tags: ['Narrative', 'Game Project'],
      },
      {
        id: 'project-5',
        title: "Suzi's Punishment",
        description: 'Just a little girl fighting sheeps from hell',
        image: 'assets/Projects/suzi_s_punishment.png',
        link: 'https://barzibroz.itch.io/suzis-punishment',
        tags: ['Action', 'Game Project'],
      },
      {
        id: 'project-6',
        title: 'Floaty Space',
        description: 'C3 Prototype, indie',
        image: 'assets/Projects/floaty_space.png',
        link: 'https://idanbarzellai.itch.io/floaty-space',
        tags: ['Prototype', 'Game Project'],
      },
      {
        id: 'project-7',
        title: 'Bubble To The Moon',
        description: 'Racing',
        image: 'assets/Projects/bubble_to_the_moon.png',
        link: 'https://liadn7.itch.io/bubbletothemoon',
        tags: ['Racing', 'Game Project'],
      },
      {
        id: 'project-8',
        title: 'WEFA! - Water Earth Fire & Air',
        description: 'Final B.sc Degree in CS majoring Computer Games',
        image: 'assets/Projects/wefa_water_earth_fire_air.png',
        link: 'https://idanbarzellai.itch.io/wefa',
        tags: ['Final Project', 'Game Project'],
      },
      {
        id: 'project-9',
        title: 'Maze Away',
        description: 'Puzzle',
        image: 'assets/Projects/maze_away.png',
        link: 'https://idanbarzellai.itch.io/maze-away',
        tags: ['Puzzle', 'Game Project'],
      },
      {
        id: 'project-10',
        title: 'Jack And The Beanstalk - StoryTelling',
        description: 'Script Writing M.des. Course',
        image: 'assets/Projects/jack_and_the_beanstalk_storytelling.png',
        link: 'https://idanbarzellai.itch.io/jack-and-the-beanstalk',
        tags: ['Storytelling', 'Game Project'],
      },
      {
        id: 'project-11',
        title: 'The Wizard Of Wave Island',
        description: 'A gamejam project, brainwave as key inputs, and demands a focus level to win',
        image: 'assets/Projects/the_wizard_of_wave_island.png',
        link: 'https://idanbarzellai.itch.io/the-wizard-of-wave-island',
        tags: ['Game Jam', 'Game Project'],
      },
    ],
  },
  {
    id: 'work-experience',
    title: 'Work Experience',
    content:
      'Level Designer - Moon Active (Starting 2026) • Game Dev Team Lead at Spinomenal (2023-2026) • Game Developer at Spinomenal (2022-2023) • Unity Instructor at Appleseeds Neta Project (2021-2022)',
    roomTitle: 'Factory of Experience',
    roomSubtitle: 'Each station on the line is a workplace milestone.',
    items: [
      {
        id: 'work-1',
        title: 'Moon Active',
        description: 'Level Designer (Starting 2026)',
      },
      {
        id: 'work-2',
        title: 'Spinomenal - Game Dev Team Lead (2023-2026)',
        description: 'Led team workflows, onboarding, repository management, code reviews, and gameplay polish.',
      },
      {
        id: 'work-3',
        title: 'Spinomenal - Game Developer (2022-2023)',
        description: 'Built and iterated gameplay features in Phaser/Construct 2 and collaborated across design, QA, and product.',
      },
    ],
  },
  {
    id: 'academic-experience',
    title: 'Academic Experience',
    content:
      'B.Sc. Software Engineering • Game AI Research Project • Human-Computer Interaction Lab • Interactive Media Workshop',
    roomTitle: 'Academic Library',
    roomSubtitle: 'Each shelf lane is an academic reference area.',
    items: [
      { id: 'acad-1', title: 'B.Sc. Software Engineering', description: 'Formal training in CS fundamentals and software systems.' },
      { id: 'acad-2', title: 'Game AI Research', description: 'Practical experimentation with decision and behavior models.' },
      { id: 'acad-3', title: 'HCI Lab', description: 'User studies and feedback-oriented interaction design.' },
      { id: 'acad-4', title: 'Interactive Media', description: 'Narrative and systems integration across digital media.' },
    ],
  },
  {
    id: 'languages',
    title: 'Languages',
    content: 'Hebrew (Native) • English (Fluent)',
    roomTitle: 'Language Hangar',
    roomSubtitle: 'Each tag marks a language used in production or prototyping.',
    items: [
      { id: 'lang-1', title: 'Hebrew', description: 'Native' },
      { id: 'lang-2', title: 'English', description: 'Fluent' },
    ],
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function createItemsFromSimpleList(lines: string[], idPrefix: string, categoryHeadings: Set<string>): SectionItemData[] {
  const items: SectionItemData[] = [];
  let category = '';

  for (const line of lines) {
    if (categoryHeadings.has(line)) {
      category = line;
      continue;
    }

    items.push({
      id: `${idPrefix}-${items.length + 1}`,
      title: line,
      description: category ? `Category: ${category}` : '',
    });
  }

  return items;
}

function parseProjectsFromText(content: string): ProjectData[] {
  const blocks = parseBlocks(content);
  const projects: ProjectData[] = [];
  for (const block of blocks) {
    const blockLines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const title = blockLines[0] ?? '';
    if (!title) {
      continue;
    }

    const description = blockLines[1] ?? '';
    const linkCandidate = blockLines.find((line) => /^https?:\/\//i.test(line));
    const slug = slugify(title);

    projects.push({
      id: `project-${projects.length + 1}`,
      title,
      description,
      image: `assets/Projects/${slug}.png`,
      link: linkCandidate,
      tags: ['Game Project'],
    });
  }

  return projects;
}

function parseLanguagesFromText(content: string): SectionItemData[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      const [title, proficiency] = line.split('-').map((part) => part.trim());
      return {
        id: `lang-${index + 1}`,
        title,
        description: proficiency || '',
      };
    });
}

function parseBlocks(content: string): string[] {
  return content
    .split(/\r?\n\s*\r?\n/g)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

function summarizeBlocks(blocks: string[]): SectionItemData[] {
  return blocks.map((block, index) => {
    const blockLines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const title = blockLines[0] ?? `Item ${index + 1}`;
    const description = blockLines.slice(1).join(' • ');

    return {
      id: `item-${index + 1}`,
      title,
      description,
    };
  });
}

async function fetchTextAsset(path: string): Promise<string | null> {
  try {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch {
    return null;
  }
}

async function resolveProjectLinks(projects: ProjectData[]): Promise<ProjectData[]> {
  const linkedProjects = await Promise.all(
    projects.map(async (project) => {
      const slug = slugify(project.title);
      const sidecar = await fetchTextAsset(`assets/Projects/${slug}.txt`);
      const link = sidecar
        ?.split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => /^https?:\/\//i.test(line));

      return {
        ...project,
        link: link || project.link,
      };
    })
  );

  return linkedProjects;
}

export async function hydratePortfolioSectionsFromAssets(): Promise<void> {
  const [skillsText, projectsText, workText, academicText, languagesText] = await Promise.all([
    fetchTextAsset('assets/Skills/skills.txt'),
    fetchTextAsset('assets/Projects/projects.txt'),
    fetchTextAsset('assets/Work/work.txt'),
    fetchTextAsset('assets/Academic/academic.txt'),
    fetchTextAsset('assets/Languages/languages.txt'),
  ]);

  const sectionMap = new Map(portfolioSections.map((section) => [section.id, section]));

  if (skillsText) {
    const lines = skillsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const skillItems = createItemsFromSimpleList(
      lines,
      'skill',
      new Set(['Game Design & Production', 'Tools & Platforms', 'Programming'])
    );

    const section = sectionMap.get('skills');
    if (section) {
      section.content = lines.join(' • ');
      section.items = skillItems;
    }
  }

  if (projectsText) {
    const projects = parseProjectsFromText(projectsText);
    const section = sectionMap.get('projects');
    if (section) {
      section.projects = await resolveProjectLinks(projects);
      section.content = `${projects.length} projects loaded from assets/Projects/projects.txt`;
    }
  }

  if (workText) {
    const blocks = parseBlocks(workText);
    const section = sectionMap.get('work-experience');
    if (section) {
      section.content = blocks.join(' • ');
      section.items = summarizeBlocks(blocks.slice(1)).map((item, index) => ({
        ...item,
        id: `work-${index + 1}`,
      }));
    }
  }

  if (academicText) {
    const blocks = parseBlocks(academicText);
    const section = sectionMap.get('academic-experience');
    if (section) {
      section.content = blocks.join(' • ');
      section.items = summarizeBlocks(blocks).map((item, index) => ({
        ...item,
        id: `acad-${index + 1}`,
      }));
    }
  }

  if (languagesText) {
    const items = parseLanguagesFromText(languagesText);
    const section = sectionMap.get('languages');
    if (section) {
      section.items = items;
      section.content = items.map((item) => `${item.title} (${item.description})`).join(' • ');
    }
  }

  portfolioSections = Array.from(sectionMap.values());
}
