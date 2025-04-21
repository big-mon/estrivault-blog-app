<script lang="ts">
	import { NAVIGATION_LINKS } from '../../constants/index';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();
</script>

<nav>
	<ul>
		{#each NAVIGATION_LINKS as link}
			<li>
				<a href={link.href} class={pathname === link.href ? 'active' : ''}>{link.label}</a>
			</li>
		{/each}
	</ul>
</nav>
