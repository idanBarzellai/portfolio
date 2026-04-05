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
    id: 'about',
    title: 'About Me',
    content:
      "I'm a passionate game designer and developer with experience in creating engaging 2D and 3D experiences. I love crafting unique gameplay mechanics and building immersive worlds.",
  },
  {
    id: 'skills',
    title: 'Skills',
    content: 'Game Design • Level Design • Mechanics Design • Player Experience • Unity • Unreal Engine • Python • C#',
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
    id: 'experience',
    title: 'Experience',
    content:
      'Game Designer at Studio X (2021-2023) • Level Designer at Studio Y (2020-2021) • Independent Developer (2019-Present)',
  },
  {
    id: 'contact',
    title: 'Contact',
    content: 'Email: idan@example.com | LinkedIn: linkedIn.com/in/idan | GitHub: github.com/idanBarzellai',
  },
];
