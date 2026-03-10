<script lang="ts">
	import { getSiteConfig } from '$lib/content';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();
	let { data } = $props();
	const project = data.project;

	const isOngoing = project.date_end === null;
	const dateRange = isOngoing
		? `${project.date_start}–present`
		: `${project.date_start}–${project.date_end}`;
</script>

<SEO title={project.title} description={project.description ?? project.subtitle} url={`/projects/${project.slug}`} />

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Back link -->
	<a
		href="/projects"
		class="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-8"
	>
		&larr; Back to projects
	</a>

	<!-- Header -->
	<div class="mb-10">
		<div class="flex items-center gap-3 mb-2">
			<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
				{project.title}
			</h1>
			{#if isOngoing}
				<span
					class="shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
				>
					Ongoing
				</span>
			{/if}
		</div>
		<p class="text-lg text-gray-600 dark:text-gray-400 mb-2">{project.subtitle}</p>
		<p class="text-sm text-gray-500 dark:text-gray-500">{dateRange}</p>
	</div>

	<!-- Tags -->
	{#if project.tags && project.tags.length > 0}
		<div class="flex flex-wrap gap-2 mb-8">
			{#each project.tags as tag}
				<span
					class="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
				>
					{tag}
				</span>
			{/each}
		</div>
	{/if}

	<!-- Description -->
	{#if project.description}
		<section class="mb-10">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
			<p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
				{project.description}
			</p>
		</section>
	{/if}

	<!-- Tech stack -->
	{#if project.tech && project.tech.length > 0}
		<section class="mb-10">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Tech Stack</h2>
			<div class="flex flex-wrap gap-2">
				{#each project.tech as t}
					<span
						class="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
					>
						{t}
					</span>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Collaborators -->
	{#if project.collaborators && project.collaborators.length > 0}
		<section class="mb-10">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Collaborators</h2>
			<ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
				{#each project.collaborators as collab}
					<li>{collab.name}</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Links -->
	{#if project.links && project.links.length > 0}
		<section class="mb-10">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Links</h2>
			<div class="flex flex-wrap gap-3">
				{#each project.links as link}
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
					>
						{link.label}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6h6m0 0v6m0-6L9.75 14.25"
							/>
						</svg>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>
