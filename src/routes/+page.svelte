<script lang="ts">
	import { getSiteConfig, getFeaturedProjects, getFeaturedPublications } from '$lib/content';
	import Hero from '$lib/components/Hero.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import PublicationItem from '$lib/components/PublicationItem.svelte';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();
	const featuredProjects = getFeaturedProjects();
	const recentPubs = getFeaturedPublications();
</script>

<SEO title="Home" description={site.bio_short} url="/" />

<Hero
	name={site.name}
	position={site.position}
	institution={site.institution}
	bio_short={site.bio_short}
	photo={site.photo}
	research_interests={site.research_interests}
/>

<!-- Featured Projects -->
{#if featuredProjects.length > 0}
	<section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
		<h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Featured Projects</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each featuredProjects as project}
				<ProjectCard {project} />
			{/each}
		</div>
		<div class="mt-8 text-center">
			<a href="/projects" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
				View all projects &rarr;
			</a>
		</div>
	</section>
{/if}

<!-- Recent Publications -->
{#if recentPubs.length > 0}
	<section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
		<h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Recent Publications</h2>
		<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800 px-5">
			{#each recentPubs as publication}
				<PublicationItem {publication} />
			{/each}
		</div>
		<div class="mt-8 text-center">
			<a href="/publications" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
				View all publications &rarr;
			</a>
		</div>
	</section>
{/if}
