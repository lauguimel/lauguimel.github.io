<script lang="ts">
	import { getSiteConfig, getTeaching } from '$lib/content';
	import CourseItem from '$lib/components/CourseItem.svelte';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();
	const courses = getTeaching();
</script>

<SEO title="Teaching" description="Courses and teaching experience" url="/teaching" />

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-10">Teaching</h1>

	{#if courses.length === 0}
		<p class="text-gray-500 dark:text-gray-400 text-lg">Coming soon.</p>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each courses as item}
				<CourseItem {item} />
			{/each}
		</div>
	{/if}
</div>
