<script lang="ts">
  import { onMount } from 'svelte';
  import Title from './Title.svelte';
  import ResponsiveMenu from './ResponsiveMenu.svelte';
  import Robot from '$components/Icons/Robot.svelte';

  interface Props {
    pathname: string;
  }

  const { pathname }: Props = $props();

  let isHeaderVisible = $state(true);
  let lastScrollY = $state(0);

  onMount(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        isHeaderVisible = false;
      } else if (currentScrollY < lastScrollY) {
        isHeaderVisible = true;
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<header
  class="sticky top-0 z-50 w-full px-4 py-3 transition-transform duration-300 ease-in-out"
  class:-translate-y-full={!isHeaderVisible}
>
  <div
    class="mx-auto max-w-6xl rounded-xl bg-white
         px-4 py-3 shadow-md sm:px-6 lg:px-8"
  >
    <div class="flex items-center justify-between">
      <div><Title /></div>
      <div class="flex items-center gap-4">
        <a
          href="/llms.txt"
          class="hidden rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:block"
          title="AI向け記事一覧(llms.txt)"
          target="_blank"
          aria-label="AI向け記事一覧"
        >
          <Robot />
        </a>
        <ResponsiveMenu {pathname} />
      </div>
    </div>
  </div>
</header>
