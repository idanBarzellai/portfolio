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

export const portfolioSections: SectionData[] = [
  {
    id: 'skills',
    title: 'Skills',
    content: 'Game Design • Level Design • Mechanics Design • Player Experience • Unity • Unreal Engine • Prototyping • Balancing',
    roomTitle: 'Blacksmith Workshop',
    roomSubtitle: 'Each weapon stand is a key skill set.',
    items: [
      { id: 'skill-1', title: 'Game Design', description: 'Core loop design, pacing, and reward systems.' },
      { id: 'skill-2', title: 'Level Design', description: 'Readable flow, challenge curves, and encounter design.' },
      { id: 'skill-3', title: 'Mechanics Design', description: 'Crafting expressive movement and interaction systems.' },
      { id: 'skill-4', title: 'Player Experience', description: 'Balancing challenge, clarity, and feedback.' },
      { id: 'skill-5', title: 'Prototyping', description: 'Rapid iteration from concept to playable tests.' },
      { id: 'skill-6', title: 'Balancing', description: 'Tuning numbers and interactions for fairness and fun.' },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    content: 'Check out my latest game projects and design work:',
    roomTitle: 'Projects Gallery',
    roomSubtitle: 'A room of playable and design-focused project frames.',
    projects: [
      {
        id: 'project-1',
        title: 'Pixel Adventure',
        description: 'A retro 2D platformer with dynamic level generation',
        image: undefined,
        link: 'https://example.com/pixel-adventure',
        tags: ['Unity', 'C#', 'Platformer'],
      },
      {
        id: 'project-2',
        title: 'Puzzle Realm',
        description: 'A puzzle game exploring spatial reasoning',
        image: undefined,
        tags: ['Game Design', 'Mechanics'],
      },
    ],
  },
  {
    id: 'work-experience',
    title: 'Work Experience',
    content:
      'Game Designer at Studio X (2021-2023) • Level Designer at Studio Y (2020-2021) • Independent Developer (2019-Present)',
    roomTitle: 'Factory of Experience',
    roomSubtitle: 'Each station on the line is a workplace milestone.',
    items: [
      {
        id: 'work-1',
        title: 'Studio X',
        description: 'Game Designer (2021-2023) - owned core gameplay systems and tuning.',
      },
      {
        id: 'work-2',
        title: 'Studio Y',
        description: 'Level Designer (2020-2021) - designed progression-focused stages.',
      },
      {
        id: 'work-3',
        title: 'Indie Work',
        description: 'Independent Developer (2019-Present) - prototypes and shipped demos.',
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
    content: 'C# • TypeScript • Python • C++ • JavaScript • SQL',
    roomTitle: 'Language Hangar',
    roomSubtitle: 'Each tag marks a language used in production or prototyping.',
    items: [
      { id: 'lang-1', title: 'C#', description: 'Gameplay systems and tooling.' },
      { id: 'lang-2', title: 'TypeScript', description: 'Web game prototyping and architecture.' },
      { id: 'lang-3', title: 'Python', description: 'Automation, data handling, and scripting.' },
      { id: 'lang-4', title: 'C++', description: 'Performance-focused systems familiarity.' },
      { id: 'lang-5', title: 'JavaScript', description: 'Runtime and browser gameplay interactions.' },
      { id: 'lang-6', title: 'SQL', description: 'Data querying and structured content storage.' },
    ],
  },
];
