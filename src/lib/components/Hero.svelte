<script lang="ts">
	let { name, position, institution, bio_short, photo, research_interests }: {
		name: string;
		position: string;
		institution: string;
		bio_short: string;
		photo: string;
		research_interests: string[];
	} = $props();

	const initials = name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
</script>

<section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
	<div class="flex flex-col md:flex-row items-center gap-10 md:gap-16">
		<!-- Photo / initials -->
		<div class="shrink-0">
			{#if photo}
				<img
					src={photo}
					alt={name}
					class="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow-lg ring-4 ring-gray-200 dark:ring-gray-700"
				/>
			{:else}
				<div class="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow-lg ring-4 ring-gray-200 dark:ring-gray-700">
					<span class="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-300">{initials}</span>
				</div>
			{/if}
		</div>

		<!-- Text -->
		<div class="text-center md:text-left">
			<h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
				{name}
			</h1>
			<p class="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-6">
				{position} &mdash; {institution}
			</p>
			<p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 max-w-2xl">
				{bio_short}
			</p>

			{#if research_interests && research_interests.length > 0}
				<div class="flex flex-wrap gap-2 justify-center md:justify-start">
					{#each research_interests as interest}
						<span class="px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
							{interest}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
