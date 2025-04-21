<script lang="ts">
	import { NAVIGATION_LINKS } from '../../constants/index';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();
</script>

<nav aria-label="Main navigation">
	<ul class="flex gap-4 text-sm font-medium">
		{#each NAVIGATION_LINKS as { label, href }}
			<li>
				<a
					{href}
					class="transition-opacity hover:opacity-80 {pathname === href
						? 'text-blue-600 underline'
						: 'text-gray-700'}"
					aria-current={pathname === href ? 'page' : undefined}
				>
					{label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
