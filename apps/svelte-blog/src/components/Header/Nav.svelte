<script lang="ts">
  import { NAVIGATION_LINKS } from '../../constants/index';
  import { goto } from '$app/navigation';

  interface Props {
    pathname: string;
    onNavigate?: (href: string) => Promise<void>;
  }

  const { pathname, onNavigate }: Props = $props();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  async function handleClick(event: MouseEvent, href: string) {
    event.preventDefault();
    if (onNavigate) {
      await onNavigate(href);
    }
    await goto(href);
  }
</script>

<nav aria-label="Main navigation">
  <ul class="flex flex-col gap-3 text-base font-medium md:flex-row md:items-center md:gap-6">
    {#each NAVIGATION_LINKS as { label, href }}
      <li>
        <a
          {href}
          onclick={(event) => handleClick(event, href)}
          class="block rounded-md px-2 py-2 transition-colors hover:bg-gray-100 hover:text-gray-900 {isActive(href)
            ? 'font-semibold text-gray-900 bg-gray-100'
            : 'text-gray-600'}"
          aria-current={isActive(href) ? 'page' : undefined}
        >
          {label}
        </a>
      </li>
    {/each}
  </ul>
</nav>
