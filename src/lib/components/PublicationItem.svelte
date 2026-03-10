<script lang="ts">
	import type { Publication } from '$lib/types';

	let { publication }: { publication: Publication } = $props();

	const typeLabels: Record<string, string> = {
		article: 'Article',
		inproceedings: 'Conference',
		patent: 'Patent',
		misc: 'Other'
	};

	const typeBadgeColors: Record<string, string> = {
		article: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
		inproceedings: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
		patent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
		misc: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
	};
</script>

<div class="py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
	<div class="flex items-start gap-3">
		<span class="shrink-0 mt-1 px-2 py-0.5 text-xs font-medium rounded-full {typeBadgeColors[publication.type] || typeBadgeColors.misc}">
			{typeLabels[publication.type] || 'Other'}
		</span>
		<div class="min-w-0">
			<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
				{publication.authors.join(', ')}
			</p>
			<h3 class="font-semibold text-gray-900 dark:text-white mb-1">
				{publication.title}
			</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				<em>{publication.journal}</em>, {publication.year}.
				{#if publication.volume}Vol. {publication.volume}{/if}
				{#if publication.pages}, pp. {publication.pages}{/if}
			</p>
			{#if publication.doi}
				<a
					href="https://doi.org/{publication.doi}"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-block mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
				>
					DOI: {publication.doi}
				</a>
			{/if}
		</div>
	</div>
</div>
