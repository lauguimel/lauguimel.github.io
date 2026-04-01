<script lang="ts">
	import type { TeachingItem } from '$lib/types';

	let { item }: { item: TeachingItem } = $props();
</script>

<div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-3 shadow-sm">
	<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
</div>
