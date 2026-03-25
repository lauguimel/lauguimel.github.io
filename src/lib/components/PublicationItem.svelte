<script lang="ts">
	import type { Publication } from '$lib/types';

	let { publication }: { publication: Publication } = $props();

	let expanded = $state(false);

	const typeLabels: Record<string, string> = {
		article: 'Article',
		inproceedings: 'Conference',
		patent: 'Patent',
		misc: 'Other'
	};

	const typeBadgeColors: Record<string, string> = {
		article: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
		inproceedings: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
		patent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
		misc: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
	};

	// Format authors: highlight "Maîtrejean" in bold
	function formatAuthors(authors: string[]): { name: string; highlight: boolean }[] {
		return authors.map(a => ({
			name: a,
			highlight: a.toLowerCase().includes('maitrejean') || a.toLowerCase().includes('maîtrejean')
		}));
	}

	const authors = formatAuthors(publication.authors);
	const hasLinks = publication.doi || publication.hal_url || publication.pdf_url;
	const hasDetails = publication.abstract || hasLinks;
</script>

<div class="py-4">
	<!-- Clickable header -->
	<button
		type="button"
		class="w-full text-left group cursor-pointer"
		onclick={() => { if (hasDetails) expanded = !expanded; }}
	>
		<div class="flex items-start gap-3">
			<span class="shrink-0 mt-1 px-2 py-0.5 text-xs font-medium rounded-full {typeBadgeColors[publication.type] || typeBadgeColors.misc}">
				{typeLabels[publication.type] || 'Other'}
			</span>
			<div class="min-w-0 flex-1">
				<!-- Authors -->
				<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
					{#each authors as author, i}
						{#if author.highlight}<strong class="text-gray-900 dark:text-gray-200">{author.name}</strong>{:else}{author.name}{/if}{#if i < authors.length - 1}, {/if}
					{/each}
					<span class="text-gray-400 dark:text-gray-500">({publication.year})</span>
				</p>

				<!-- Title -->
				<h3 class="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
					{publication.title}
				</h3>

				<!-- Journal -->
				<p class="text-sm text-gray-500 dark:text-gray-400">
					<em>{publication.journal}</em>
					{#if publication.volume}, Vol. {publication.volume}{/if}
					{#if publication.pages}, pp. {publication.pages}{/if}
				</p>

				<!-- Quick links (always visible) -->
				{#if hasLinks}
					<div class="flex flex-wrap gap-3 mt-2">
						{#if publication.doi}
							<a
								href="https://doi.org/{publication.doi}"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
								onclick={(e) => e.stopPropagation()}
							>
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
								DOI
							</a>
						{/if}
						{#if publication.hal_url}
							<a
								href={publication.hal_url}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
								onclick={(e) => e.stopPropagation()}
							>
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
								HAL
							</a>
						{/if}
						{#if publication.pdf_url}
							<a
								href={publication.pdf_url}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
								onclick={(e) => e.stopPropagation()}
							>
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
								PDF
							</a>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Expand indicator -->
			{#if hasDetails}
				<svg
					class="w-5 h-5 shrink-0 mt-1 text-gray-400 transition-transform duration-200 {expanded ? 'rotate-180' : ''}"
					fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
				</svg>
			{/if}
		</div>
	</button>

	<!-- Expandable panel -->
	{#if expanded && hasDetails}
		<div class="mt-3 ml-[4.5rem] pl-4 border-l-2 border-primary-200 dark:border-primary-800 space-y-3 animate-fadeIn">
			{#if publication.abstract}
				<div>
					<h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Abstract</h4>
					<p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{publication.abstract}</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fadeIn {
		animation: fadeIn 0.2s ease-out;
	}
</style>
