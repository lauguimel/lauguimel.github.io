<script lang="ts">
	import { getSiteConfig, getProjects } from '$lib/content';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();
	const projects = getProjects();
</script>

<SEO title="Projects" description="Research projects portfolio" url="/projects" />

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-10">Projects</h1>

	{#if projects.length === 0}
		<p class="text-gray-500 dark:text-gray-400 text-lg">Coming soon.</p>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each projects as project}
				<ProjectCard {project} />
			{/each}
		</div>
	{/if}
</div>
