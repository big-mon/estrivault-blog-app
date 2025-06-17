<script lang="ts">
  import { onMount } from 'svelte';
  import Title from './Title.svelte';
  import ResponsiveMenu from './ResponsiveMenu.svelte';

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
  class="sticky top-0 z-50 w-full px-4 py-4 transition-transform duration-300 ease-in-out"
  class:-translate-y-full={!isHeaderVisible}
>
  <div
    class="mx-auto max-w-6xl rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50
         px-6 py-4 shadow-xl shadow-gray-900/10 sm:px-8 lg:px-10"
  >
    <div class="flex items-center justify-between">
      <div><Title /></div>
      <ResponsiveMenu {pathname} />
    </div>
  </div>
</header>
