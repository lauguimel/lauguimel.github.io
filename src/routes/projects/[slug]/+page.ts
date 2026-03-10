import { getProjects, getProject } from '$lib/content';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	return getProjects().map((p) => ({ slug: p.slug }));
};

export function load({ params }) {
	const project = getProject(params.slug);
	if (!project) error(404, 'Project not found');
	return { project };
}
