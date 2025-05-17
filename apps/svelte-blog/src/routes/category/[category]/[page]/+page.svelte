<script lang="ts">
	import PostCard from '../../../../components/PostCard/PostCard.svelte';
	import type { PageData } from '../../../$types';
	import type { PostMeta } from '@estrivault/content-processor';

	export let data: PageData;
	const { posts, category, pagination } = data as {
		posts: PostMeta[];
		category: string;
		pagination: {
			page: number;
			perPage: number;
			total: number;
			totalPages: number;
		};
	};
</script>

<svelte:head>
	<title>{category}の記事一覧</title>
	<meta name="description" content="{category}カテゴリーの記事一覧ページです。" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold">{category} カテゴリーの記事一覧</h1>
		<p class="text-gray-600">全{posts.length}件の記事</p>
	</div>

	{#if posts.length > 0}
		<div class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			{#each posts as post}
				<PostCard {post} />
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-gray-600">このカテゴリーにはまだ記事がありません。</p>
		</div>
	{/if}
</div>
