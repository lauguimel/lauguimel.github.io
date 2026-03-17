<script lang="ts">
	import { getSiteConfig } from '$lib/content';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();

	const experience = site.experience ?? [];
	const education = site.education ?? [];
</script>

<SEO title="About" description={site.bio_short} url="/about" />

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
	<!-- Bio -->
	<section>
		<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">About</h1>
		<p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
			{site.bio_long}
		</p>
	</section>

	<!-- Research Interests -->
	{#if site.research_interests && site.research_interests.length > 0}
		<section>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Research Interests</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{#each site.research_interests as interest}
					<div
						class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
					>
						<p class="text-gray-800 dark:text-gray-200 font-medium">{interest}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Skills -->
	{#if site.skills && Object.keys(site.skills).length > 0}
		<section>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Skills</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{#each Object.entries(site.skills) as [category, items]}
					<div>
						<h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
							{category}
						</h3>
						<div class="flex flex-wrap gap-2">
							{#each items as skill}
								<span
									class="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
								>
									{skill}
								</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Experience -->
	{#if experience.length > 0}
		<section>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Experience</h2>
			<div class="space-y-4">
				{#each experience as item}
					<div
						class="flex items-start gap-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
					>
						<div
							class="shrink-0 w-2 h-2 mt-2.5 rounded-full bg-primary-500 dark:bg-primary-400"
						></div>
						<div>
							<p class="font-semibold text-gray-900 dark:text-white">{item.title}</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{item.institution} &mdash; {item.years}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Education -->
	{#if education.length > 0}
		<section>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Education</h2>
			<div class="space-y-4">
				{#each education as item}
					<div
						class="flex items-start gap-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
					>
						<div
							class="shrink-0 w-2 h-2 mt-2.5 rounded-full bg-amber-500 dark:bg-amber-400"
						></div>
						<div>
							<p class="font-semibold text-gray-900 dark:text-white">{item.degree}</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{item.institution} &mdash; {item.years}
							</p>
							{#if item.topic}
								<p class="text-sm text-gray-500 dark:text-gray-500 mt-1 italic">{item.topic}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
