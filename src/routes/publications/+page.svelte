<script lang="ts">
	import { getSiteConfig, getPublications, getProjects } from '$lib/content';
	import PublicationItem from '$lib/components/PublicationItem.svelte';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();
	const publications = getPublications();
	const projects = getProjects();

	// Build a map of project slug -> project title
	const projectTitleMap = new Map<string, string>();
	for (const p of projects) {
		projectTitleMap.set(p.slug, p.title);
	}

	// Group publications by project_slug
	const byProject = new Map<string, typeof publications>();
	const other: typeof publications = [];

	for (const pub of publications) {
		if (pub.project_slug && projectTitleMap.has(pub.project_slug)) {
			if (!byProject.has(pub.project_slug)) byProject.set(pub.project_slug, []);
			byProject.get(pub.project_slug)!.push(pub);
		} else {
			other.push(pub);
		}
	}

	// Sort within each group by year descending (already sorted globally, but ensure per-group)
	for (const pubs of byProject.values()) {
		pubs.sort((a, b) => b.year - a.year);
	}
	other.sort((a, b) => b.year - a.year);

	// Order project sections by the project that has the most recent publication first
	const projectSlugs = [...byProject.keys()].sort((a, b) => {
		const maxA = byProject.get(a)![0].year;
		const maxB = byProject.get(b)![0].year;
		return maxB - maxA;
	});
</script>

<SEO title="Publications" description="Research publications list" url="/publications" />

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Publications</h1>
	<p class="text-gray-500 dark:text-gray-400 mb-10">{publications.length} publications</p>

	{#if publications.length === 0}
		<p class="text-gray-500 dark:text-gray-400 text-lg">Coming soon.</p>
	{:else}
		<div class="space-y-10">
			{#each projectSlugs as slug}
				<section>
					<h2
						class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800"
					>
						<a href="/projects/{slug}" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
							{projectTitleMap.get(slug)}
						</a>
					</h2>
					<div
						class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800 px-5"
					>
						{#each byProject.get(slug) ?? [] as publication}
							<PublicationItem {publication} />
						{/each}
					</div>
				</section>
			{/each}

			{#if other.length > 0}
				<section>
					<h2
						class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800"
					>
						Other
					</h2>
					<div
						class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800 px-5"
					>
						{#each other as publication}
							<PublicationItem {publication} />
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>
