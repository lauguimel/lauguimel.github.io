<script lang="ts">
	const { title, description, url } = $props<{
		title: string;
		description: string;
		url: string;
	}>();

	const siteName = 'Guillaume Maitrejean';
	const fullTitle = `${title} | ${siteName}`;
	const canonicalUrl = `https://lauguimel.github.io${url}`;
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content="website" />
	<link rel="canonical" href={canonicalUrl} />
</svelte:head>
