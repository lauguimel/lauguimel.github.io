<script lang="ts">
	import { getSiteConfig } from '$lib/content';
	import SEO from '$lib/components/SEO.svelte';

	const site = getSiteConfig();
</script>

<SEO title="CV" description="Curriculum Vitae" url="/cv" />

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-10">
		Curriculum Vitae
	</h1>

	<div
		class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm text-center"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.5"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
			/>
		</svg>
		<p class="text-lg text-gray-700 dark:text-gray-300 mb-6">
			Download my full curriculum vitae in PDF format.
		</p>
		<a
			href="/cv.pdf"
			download
			class="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
				/>
			</svg>
			Download CV (PDF)
		</a>
	</div>
</div>
