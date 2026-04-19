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
export declare let portfolioSections: SectionData[];
export declare function hydratePortfolioSectionsFromAssets(): Promise<void>;
//# sourceMappingURL=portfolioData.d.ts.map