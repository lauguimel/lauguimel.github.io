<script lang="ts">
	import { getSiteConfig, getProjects } from '$lib/content';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();
	const projects = getProjects();
	const researchProjects = projects.filter((p) => p.category === 'research');
	const personalProjects = projects.filter((p) => p.category === 'personal');
</script>

<SEO title="Projects" description="Research and personal projects portfolio" url="/projects" />

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-10">Projects</h1>

	{#if researchProjects.length > 0}
		<section class="mb-16">
			<h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Research</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each researchProjects as project}
					<ProjectCard {project} />
				{/each}
			</div>
		</section>
	{/if}

	{#if personalProjects.length > 0}
		<section>
			<h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Side Projects</h2>
			<p class="text-gray-500 dark:text-gray-400 mb-6">Personal projects driven by curiosity — applied physics, data science, and outdoor tools.</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each personalProjects as project}
					<ProjectCard {project} />
				{/each}
			</div>
		</section>
	{/if}

	{#if projects.length === 0}
		<p class="text-gray-500 dark:text-gray-400 text-lg">Coming soon.</p>
	{/if}
</div>
