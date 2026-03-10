<script lang="ts">
	import type { TeachingItem } from '$lib/types';

	let { item }: { item: TeachingItem } = $props();
</script>

<div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
	<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
	<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
		{item.institution} &mdash; {item.level}
	</p>
	<div class="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
		{#if item.years}
			<span>{item.years}</span>
		{/if}
		{#if item.hours}
			<span>{item.hours}</span>
		{/if}
	</div>
	{#if item.topics && item.topics.length > 0}
		<ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
			{#each item.topics as topic}
				<li>{topic}</li>
			{/each}
		</ul>
	{/if}
</div>
