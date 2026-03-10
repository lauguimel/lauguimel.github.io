<script lang="ts">
	import ThemeToggle from './ThemeToggle.svelte';
	import { getSiteConfig } from '$lib/content';

	const site = getSiteConfig();
	let mobileOpen = $state(false);

	const links = [
		{ label: 'Home', href: '/' },
		{ label: 'About', href: '/about' },
		{ label: 'Publications', href: '/publications' },
		{ label: 'Projects', href: '/projects' },
		{ label: 'Teaching', href: '/teaching' },
		{ label: 'CV', href: '/cv' },
		{ label: 'Contact', href: '/contact' }
	];
</script>

<header class="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
	<nav class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<a href="/" class="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
				{site.name}
			</a>

			<!-- Desktop nav -->
			<div class="hidden md:flex items-center gap-1">
				{#each links as link}
					<a
						href={link.href}
						class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					>
						{link.label}
					</a>
				{/each}
				<ThemeToggle />
			</div>

			<!-- Mobile menu button -->
			<div class="flex items-center md:hidden gap-2">
				<ThemeToggle />
				<button
					onclick={() => (mobileOpen = !mobileOpen)}
					class="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
					aria-label="Toggle menu"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						{#if mobileOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile dropdown -->
		{#if mobileOpen}
			<div class="md:hidden pb-4 space-y-1">
				{#each links as link}
					<a
						href={link.href}
						class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						onclick={() => (mobileOpen = false)}
					>
						{link.label}
					</a>
				{/each}
			</div>
		{/if}
	</nav>
</header>
