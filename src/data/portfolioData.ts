/**
 * Portfolio Data
 * Contains sections and projects information
 */

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  link?: string;
  tags: string[];
}

export interface SectionData {
  id: string;
  title: string;
  content: string;
  projects?: ProjectData[];
}

export const portfolioSections: SectionData[] = [
  {
    id: 'skills',
    title: 'Skills',
    content: 'Game Design • Level Design • Mechanics Design • Player Experience • Unity • Unreal Engine • Prototyping • Balancing',
  },
  {
    id: 'projects',
    title: 'Projects',
    content: 'Check out my latest game projects and design work:',
    projects: [
      {
        id: 'project-1',
        title: 'Pixel Adventure',
        description: 'A retro 2D platformer with dynamic level generation',
        link: 'https://example.com/pixel-adventure',
        tags: ['Unity', 'C#', 'Platformer'],
      },
      {
        id: 'project-2',
        title: 'Puzzle Realm',
        description: 'A puzzle game exploring spatial reasoning',
        tags: ['Game Design', 'Mechanics'],
      },
    ],
  },
  {
    id: 'work-experience',
    title: 'Work Experience',
    content:
      'Game Designer at Studio X (2021-2023) • Level Designer at Studio Y (2020-2021) • Independent Developer (2019-Present)',
  },
  {
    id: 'academic-experience',
    title: 'Academic Experience',
    content:
      'B.Sc. Software Engineering • Game AI Research Project • Human-Computer Interaction Lab • Interactive Media Workshop',
  },
  {
    id: 'languages',
    title: 'Languages',
    content: 'C# • TypeScript • Python • C++ • JavaScript • SQL',
  },
];
