<script lang="ts">
	import PostCard from '$components/PostCard/PostCard.svelte';
	import type { PageData } from '../../../$types';
	import type { PostMeta } from '@estrivault/content-processor';

	const { data } = $props<{ data: PageData }>();

	// 型アサーションを使用してデータを取得
	type PageDataType = {
		posts: PostMeta[];
		category: string;
		pagination: {
			page: number;
			perPage: number;
			total: number;
			totalPages: number;
		};
	};

	const pageData = $state<PageDataType>({
		posts: [],
		category: '',
		pagination: {
			page: 1,
			perPage: 10,
			total: 0,
			totalPages: 1
		}
	});

	// 初期データを設定
	$effect(() => {
		const newData = data as unknown as PageDataType;
		pageData.posts = newData.posts;
		pageData.category = newData.category;
		pageData.pagination = newData.pagination;
	});

	// URLパラメータが変更されたらデータを更新
	$effect(() => {
		const currentPath = window.location.pathname;
		if (currentPath.includes('/category/')) {
			const newData = data as unknown as PageDataType;
			pageData.posts = newData.posts;
			pageData.category = newData.category;
			pageData.pagination = newData.pagination;
		}
	});
</script>

<svelte:head>
	<title>{pageData.category}の記事一覧</title>
	<meta name="description" content="{pageData.category}カテゴリーの記事一覧ページです。" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold">{pageData.category} カテゴリーの記事一覧</h1>
		<p class="text-gray-600">全{pageData.posts.length}件の記事</p>
	</div>

	{#if pageData.posts.length > 0}
		<div class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			{#each pageData.posts as post}
				<PostCard {post} />
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-gray-600">このカテゴリーにはまだ記事がありません。</p>
		</div>
	{/if}
</div>
