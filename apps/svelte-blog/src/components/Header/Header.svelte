<script lang="ts">
  import Title from './Title.svelte';
  import ResponsiveMenu from './ResponsiveMenu.svelte';

  interface Props {
    pathname: string;
  }

  const { pathname }: Props = $props();
</script>

<header class="sticky top-0 z-50 w-full px-4 py-3">
  <div
    class="mx-auto max-w-6xl rounded-xl bg-white
         px-4 py-3 shadow-md sm:px-6 lg:px-8"
  >
    <div class="flex items-center justify-between">
      <div><Title /></div>
      <ResponsiveMenu {pathname} />
    </div>
  </div>
</header>
