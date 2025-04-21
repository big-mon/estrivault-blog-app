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
	<ul class="flex flex-col gap-4 text-base font-medium">
		{#each NAVIGATION_LINKS as { label, href }}
			<li>
				<a
					{href}
					class="block rounded-lg px-4 py-4 text-lg transition-transform hover:bg-gray-100 active:scale-[0.98]
				{isActive(href) ? 'text-blue-600' : 'text-gray-800'}"
					aria-current={isActive(href) ? 'page' : undefined}
				>
					{label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
