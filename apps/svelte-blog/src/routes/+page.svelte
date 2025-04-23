<script lang="ts">
	import PostCard from '../components/PostCard/PostCard.svelte';

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

<div class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
	{#each posts as post}
		<PostCard {post} />
	{/each}
</div>
