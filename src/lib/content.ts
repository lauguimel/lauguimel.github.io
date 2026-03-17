import { parse } from 'yaml';
import type { SiteConfig, Project, Publication, TeachingItem } from './types';

const siteFile = import.meta.glob('/content/site.yml', {
	eager: true,
	query: '?raw',
	import: 'default'
});
const projectFiles = import.meta.glob('/content/projects/*.yml', {
	eager: true,
	query: '?raw',
	import: 'default'
});
const pubFiles = import.meta.glob('/content/publications/*.yml', {
	eager: true,
	query: '?raw',
	import: 'default'
});
const teachingFiles = import.meta.glob('/content/teaching/*.yml', {
	eager: true,
	query: '?raw',
	import: 'default'
});

function parseAll<T extends { visible: boolean }>(files: Record<string, unknown>): T[] {
	return Object.values(files)
		.map((raw) => parse(raw as string) as T)
		.filter((item) => item.visible !== false);
}

export function getSiteConfig(): SiteConfig {
	const raw = Object.values(siteFile)[0] as string;
	return parse(raw) as SiteConfig;
}

export function getProjects(): Project[] {
	return parseAll<Project>(projectFiles).sort((a, b) => b.date_start - a.date_start);
}

export function getFeaturedProjects(): Project[] {
	return getProjects().filter((p) => p.featured);
}

export function getProject(slug: string): Project | undefined {
	return getProjects().find((p) => p.slug === slug);
}

export function getPublications(): Publication[] {
	return parseAll<Publication>(pubFiles).sort((a, b) => b.year - a.year);
}

export function getFeaturedPublications(): Publication[] {
	return getPublications().filter((p) => p.featured);
}

export function getPublicationsByProject(projectSlug: string): Publication[] {
	return getPublications().filter((p) => p.project_slug === projectSlug);
}

export function getTeaching(): TeachingItem[] {
	return parseAll<TeachingItem>(teachingFiles);
}
