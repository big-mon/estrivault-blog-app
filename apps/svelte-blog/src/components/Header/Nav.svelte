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
	<ul class="flex flex-col gap-3 text-base font-medium md:flex-row md:items-center md:gap-6">
		{#each NAVIGATION_LINKS as { label, href }}
			<li>
				<a
					{href}
					class="block rounded-md px-2 py-2 transition hover:bg-gray-100 {isActive(href)
						? 'font-semibold text-blue-600'
						: 'text-gray-800'}"
					aria-current={isActive(href) ? 'page' : undefined}
				>
					{label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
