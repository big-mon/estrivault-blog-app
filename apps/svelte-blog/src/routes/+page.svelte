<script lang="ts">
	const posts = [
		{
			title: '米国株式市場、テック主導で続伸',
			slug: 'us-market-tech-rally',
			date: '2025-04-21',
			description:
				'主要テック企業の好決算を受けてS&P500とNasdaqが上昇。FOMCを前に投資家心理も改善。',
			thumbnail: 'https://res.cloudinary.com/damonge/image/upload/Hero/kotohira-konpirasan',
			category: 'Stocks',
			tags: ['NASDAQ', 'Tech', 'FOMC']
		},
		{
			title: '米国株式市場、テック主導で続伸',
			slug: 'us-market-tech-rally',
			date: '2025-04-21',
			description:
				'主要テック企業の好決算を受けてS&P500とNasdaqが上昇。FOMCを前に投資家心理も改善。',
			thumbnail: 'https://res.cloudinary.com/damonge/image/upload/Hero/kotohira-konpirasan',
			category: 'Stocks',
			tags: ['NASDAQ', 'Tech', 'FOMC']
		},
		{
			title: '米国株式市場、テック主導で続伸',
			slug: 'us-market-tech-rally',
			date: '2025-04-21',
			description:
				'主要テック企業の好決算を受けてS&P500とNasdaqが上昇。FOMCを前に投資家心理も改善。',
			thumbnail: 'https://res.cloudinary.com/damonge/image/upload/Hero/kotohira-konpirasan',
			category: 'Stocks',
			tags: ['NASDAQ', 'Tech', 'FOMC']
		},
		{
			title: '米国株式市場、テック主導で続伸',
			slug: 'us-market-tech-rally',
			date: '2025-04-21',
			description:
				'主要テック企業の好決算を受けてS&P500とNasdaqが上昇。FOMCを前に投資家心理も改善。',
			thumbnail: 'https://res.cloudinary.com/damonge/image/upload/Hero/kotohira-konpirasan',
			category: 'Stocks',
			tags: ['NASDAQ', 'Tech', 'FOMC']
		},
		{
			title: '米国株式市場、テック主導で続伸',
			slug: 'us-market-tech-rally',
			date: '2025-04-21',
			description:
				'主要テック企業の好決算を受けてS&P500とNasdaqが上昇。FOMCを前に投資家心理も改善。',
			thumbnail: 'https://res.cloudinary.com/damonge/image/upload/Hero/kotohira-konpirasan',
			category: 'Stocks',
			tags: ['NASDAQ', 'Tech', 'FOMC']
		},
		{
			title: '米国株式市場、テック主導で続伸',
			slug: 'us-market-tech-rally',
			date: '2025-04-21',
			description:
				'主要テック企業の好決算を受けてS&P500とNasdaqが上昇。FOMCを前に投資家心理も改善。',
			thumbnail: 'https://res.cloudinary.com/damonge/image/upload/Hero/kotohira-konpirasan',
			category: 'Stocks',
			tags: ['NASDAQ', 'Tech', 'FOMC']
		},
		{
			title: '米国株式市場、テック主導で続伸',
			slug: 'us-market-tech-rally',
			date: '2025-04-21',
			description:
				'主要テック企業の好決算を受けてS&P500とNasdaqが上昇。FOMCを前に投資家心理も改善。',
			thumbnail: 'https://res.cloudinary.com/damonge/image/upload/Hero/kotohira-konpirasan',
			category: 'Stocks',
			tags: ['NASDAQ', 'Tech', 'FOMC']
		},
		{
			title: '米国株式市場、テック主導で続伸',
			slug: 'us-market-tech-rally',
			date: '2025-04-21',
			description:
				'主要テック企業の好決算を受けてS&P500とNasdaqが上昇。FOMCを前に投資家心理も改善。',
			thumbnail: 'https://res.cloudinary.com/damonge/image/upload/Hero/kotohira-konpirasan',
			category: 'Stocks',
			tags: ['NASDAQ', 'Tech', 'FOMC']
		}
	];
</script>

<ul class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
	{#each posts as post}
		<li
			class="group relative transform overflow-hidden rounded-xl border border-gray-200
           bg-white shadow-sm transition-all duration-100 ease-out hover:scale-[1.01] hover:border-gray-300 hover:shadow-md"
		>
			<!-- サムネイル -->
			<div class="relative w-full overflow-hidden pt-[56.25%]">
				<img
					src={post.thumbnail}
					alt={post.title}
					class="absolute inset-0 h-full w-full object-cover"
				/>
			</div>

			<!-- カード本文 -->
			<div class="flex flex-col justify-between space-y-3 p-4 font-sans text-gray-800">
				<div class="space-y-1">
					<!-- カテゴリ -->
					<p class="text-xs uppercase tracking-wide text-gray-500">{post.category}</p>

					<!-- タイトル -->
					<h2
						class="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600"
					>
						{post.title}
					</h2>

					<!-- 日付 -->
					<p class="text-sm text-gray-500">{post.date}</p>

					<!-- 説明 -->
					<p class="line-clamp-3 text-sm text-gray-700">{post.description}</p>
				</div>

				<!-- タグ -->
				<ul class="mt-2 flex shrink-0 flex-wrap gap-2 text-xs text-gray-500">
					{#each post.tags as tag}
						<li class="rounded bg-gray-100 px-2 py-0.5">{tag}</li>
					{/each}
				</ul>
			</div>

			<!-- 透明リンクカバー -->
			<a href={`/post/${post.slug}`} class="absolute inset-0 z-10" aria-label={post.title}>
				<span class="sr-only">{post.title}</span>
			</a>
		</li>
	{/each}
</ul>
