<script lang="ts">
	let { name, position, institution, bio_short, photo, research_interests }: {
		name: string;
		position: string;
		institution: string;
		bio_short: string;
		photo: string;
		research_interests: string[];
	} = $props();
</script>

<section class="relative overflow-hidden bg-black min-h-[420px] sm:min-h-[480px]">
	<!-- Hero image: right-aligned, full height, natural aspect -->
	<div class="absolute inset-0 flex justify-end">
		<img
			src="/images/hero-bg.png"
			alt=""
			class="h-full w-auto max-w-none object-contain object-right"
		/>
	</div>

	<!-- Blur patch: from image edge toward left, dark blue blending into black -->
	<div class="absolute inset-0" style="background: linear-gradient(to right, black 20%, rgba(6, 10, 28, 0.95) 35%, rgba(15, 25, 60, 0.6) 50%, transparent 65%);"></div>

	<!-- Bottom edge blend into black -->
	<div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent"></div>

	<!-- Text content -->
	<div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
		<div class="max-w-xl">
			<div class="hidden md:block w-12 h-1 bg-blue-400 rounded-full mb-6"></div>
			<h1 class="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-3">
				{name}
			</h1>
			<p class="text-xl sm:text-2xl text-blue-200 mb-6">
				{position} &mdash; {institution}
			</p>
			<p class="text-lg text-gray-300 leading-relaxed mb-8">
				{bio_short}
			</p>

			{#if research_interests && research_interests.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each research_interests as interest}
						<span class="px-3 py-1 text-sm font-medium rounded-full bg-gray-900/60 text-blue-200 border border-blue-500/30">
							{interest}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
