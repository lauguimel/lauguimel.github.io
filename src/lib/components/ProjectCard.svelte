<script lang="ts">
	import type { Project } from '$lib/types';

	let { project }: { project: Project } = $props();

	const isOngoing = project.date_end === null;
</script>

<a
	href="/projects/{project.slug}"
	class="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 overflow-hidden transform hover:-translate-y-1"
>
	<!-- Thumbnail placeholder -->
	<div class="h-40 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-950 dark:to-gray-800 flex items-center justify-center">
		{#if project.thumbnail}
			<img src={project.thumbnail} alt={project.title} class="w-full h-full object-cover" />
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-primary-300 dark:text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
			</svg>
		{/if}
	</div>

	<div class="p-5">
		<div class="flex items-start justify-between gap-2 mb-2">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
				{project.title}
			</h3>
			{#if isOngoing}
				<span class="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
					Ongoing
				</span>
			{/if}
		</div>

		<p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
			{project.subtitle}
		</p>

		<!-- Tags -->
		{#if project.tags && project.tags.length > 0}
			<div class="flex flex-wrap gap-1.5 mb-3">
				{#each project.tags.slice(0, 4) as tag}
					<span class="px-2 py-0.5 text-xs rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		<!-- Tech stack -->
		{#if project.tech && project.tech.length > 0}
			<p class="text-xs text-gray-500 dark:text-gray-500">
				{project.tech.join(' · ')}
			</p>
		{/if}
	</div>
</a>
