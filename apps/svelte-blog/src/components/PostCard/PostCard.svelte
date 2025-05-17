<script lang="ts">
	import type { Post } from '$lib/types.ts';

	interface Props {
		post: Post;
	}

	const { post }: Props = $props();

	// 日付を yyyy-MM-dd 形式にフォーマット
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(date).replace(/\//g, '-');
	};
</script>

<article
	class="group relative transform overflow-hidden rounded-xl border border-gray-200
         bg-white shadow-sm transition-all duration-100 ease-out hover:scale-[1.01] hover:border-gray-300 hover:shadow-md"
>
	<header>
		<!-- サムネイル -->
		<figure class="relative w-full overflow-hidden pt-[56.25%]">
			<img
				src={post.coverImage}
				alt={post.title}
				class="absolute inset-0 h-full w-full object-cover"
			/>
		</figure>

		<div class="flex flex-col justify-between p-4 font-sans text-gray-800">
			<div class="space-y-1">
				<p class="text-xs uppercase tracking-wide text-gray-500">{post.category}</p>
				<h2 class="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
					{post.title}
				</h2>
				<time datetime={post.publishedAt} class="text-sm text-gray-500">{formatDate(post.publishedAt)}</time>
			</div>
		</div>
	</header>

	<section class="line-clamp-3 p-4 text-sm text-gray-700">
		{post.description}
	</section>

	<footer class="p-4">
		<ul class="mt-2 flex shrink-0 flex-wrap gap-2 text-xs text-gray-500">
			{#each post.tags as tag}
				<li class="rounded bg-gray-100 px-2 py-0.5">{tag}</li>
			{/each}
		</ul>
	</footer>

	<a href={`/post/${post.slug}`} class="absolute inset-0 z-10" aria-label={post.title}>
		<span class="sr-only">{post.title}</span>
	</a>
</article>
