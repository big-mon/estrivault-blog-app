<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate } from '$lib/utils';

	export let data: PageData;
	const { post } = data;
	const { meta, html } = post;
</script>

<svelte:head>
	<title>{meta.title} | Estrivault Blog</title>
	<meta name="description" content={meta.description} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	{#if meta.coverImage}
		<meta property="og:image" content={meta.coverImage} />
	{/if}
</svelte:head>

<article class="max-w-4xl mx-auto">
	<!-- 記事ヘッダー -->
	<header class="mb-8">
		<div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
			<span>{formatDate(meta.date)}</span>
			<span>•</span>
			<span>{meta.readingTime} min read</span>
		</div>
		
		<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{meta.title}</h1>
		
		<p class="text-xl text-gray-700 mb-6">{meta.description}</p>
		
		{#if meta.coverImage}
			<div class="relative w-full overflow-hidden rounded-xl aspect-[16/9] mb-8">
				<img
					src={meta.coverImage}
					alt={meta.title}
					class="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
		{/if}
		
		<div class="flex flex-wrap gap-2 mb-6">
			<a
				href={`/category/${meta.category.toLowerCase()}`}
				class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-200"
			>
				{meta.category}
			</a>
			
			{#each meta.tags as tag}
				<span class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
					{tag}
				</span>
			{/each}
		</div>
	</header>

	<!-- 記事本文 -->
	<div class="prose prose-lg max-w-none">
		{@html html}
	</div>
</article>
