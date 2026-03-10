<script lang="ts">
	import { getSiteConfig, getPublications } from '$lib/content';
	import PublicationItem from '$lib/components/PublicationItem.svelte';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();
	const publications = getPublications();

	// Group by year
	const byYear = new Map<number, typeof publications>();
	for (const pub of publications) {
		if (!byYear.has(pub.year)) byYear.set(pub.year, []);
		byYear.get(pub.year)!.push(pub);
	}
	const years = [...byYear.keys()].sort((a, b) => b - a);
</script>

<SEO title="Publications" description="Research publications list" url="/publications" />

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-10">Publications</h1>

	{#if publications.length === 0}
		<p class="text-gray-500 dark:text-gray-400 text-lg">Coming soon.</p>
	{:else}
		<div class="space-y-10">
			{#each years as year}
				<section>
					<h2
						class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800"
					>
						{year}
					</h2>
					<div
						class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800 px-5"
					>
						{#each byYear.get(year) ?? [] as publication}
							<PublicationItem {publication} />
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}
</div>
