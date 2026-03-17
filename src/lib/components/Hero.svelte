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

<section class="bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950/20">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
		<div class="flex flex-col md:flex-row items-center gap-10 md:gap-16">
			<!-- Photo / initials -->
			<div class="shrink-0">
				{#if photo}
					<img
						src={photo}
						alt={name}
						class="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/50"
					/>
				{:else}
					<div class="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shadow-lg ring-4 ring-primary-200 dark:ring-primary-800">
						<span class="text-4xl sm:text-5xl font-bold text-primary-600 dark:text-primary-300">{initials}</span>
					</div>
				{/if}
			</div>

			<!-- Text -->
			<div class="text-center md:text-left">
				<!-- Decorative accent line -->
				<div class="hidden md:block w-12 h-1 bg-primary-500 rounded-full mb-6"></div>
				<h1 class="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
					{name}
				</h1>
				<p class="text-xl sm:text-2xl text-primary-600 dark:text-primary-400 mb-6">
					{position} &mdash; {institution}
				</p>
				<p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 max-w-2xl">
					{bio_short}
				</p>

				{#if research_interests && research_interests.length > 0}
					<div class="flex flex-wrap gap-2 justify-center md:justify-start">
						{#each research_interests as interest}
							<span class="px-3 py-1 text-sm font-medium rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
								{interest}
							</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
