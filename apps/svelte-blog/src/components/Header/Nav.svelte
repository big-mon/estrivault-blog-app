<script lang="ts">
	import { NAVIGATION_LINKS } from '../../constants/index';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();

	function isActive(href: string) {
		return pathname === href || pathname.startsWith(href + '/');
	}
</script>

<nav aria-label="Main navigation">
	<ul class="flex flex-col gap-3 text-sm font-medium md:flex-row md:gap-4">
		{#each NAVIGATION_LINKS as { label, href }}
			<li>
				<a
					{href}
					class="block rounded px-2 py-1 transition-opacity hover:opacity-80
						{isActive(href) ? 'text-blue-600 underline md:font-semibold md:underline' : 'text-gray-700'}"
					aria-current={isActive(href) ? 'page' : undefined}
				>
					{label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
