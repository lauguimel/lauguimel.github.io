export interface SiteConfig {
	name: string;
	title: string;
	position: string;
	institution: string;
	lab: string;
	email: string;
	github: string;
	linkedin: string;
	photo: string;
	bio_short: string;
	bio_long: string;
	experience: { title: string; institution: string; years: string }[];
	education: { degree: string; institution: string; years: string; topic?: string }[];
	research_interests: string[];
	skills: Record<string, string[]>;
}

export interface Project {
	visible: boolean;
	featured: boolean;
	slug: string;
	title: string;
	subtitle: string;
	date_start: number;
	date_end: number | null;
	tags: string[];
	thumbnail: string;
	description: string;
	collaborators: { name: string }[];
	links: { label: string; url: string }[];
	tech: string[];
	figures: { src: string; caption: string }[];
	long_description: string;
}

export interface Publication {
	visible: boolean;
	featured: boolean;
	cite_key: string;
	type: 'article' | 'inproceedings' | 'patent' | 'misc';
	title: string;
	authors: string[];
	journal: string;
	year: number;
	volume: string;
	pages: string;
	doi: string;
	hal_url: string;
	abstract: string;
	pdf_url: string;
	project_slug: string;
	tags: string[];
}

export interface TeachingItem {
	visible: boolean;
	slug: string;
	title: string;
	institution: string;
	level: string;
	years: string;
	hours: string;
	description: string;
	topics: string[];
}
