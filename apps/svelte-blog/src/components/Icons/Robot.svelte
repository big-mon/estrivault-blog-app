<script lang="ts">
  interface Props {
    className?: string;
  }

  const { className = 'h-5 w-5' }: Props = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  class={className}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-label="AI Robot"
>
  <rect width="18" height="10" x="3" y="11" rx="2"></rect>
  <circle cx="12" cy="5" r="2"></circle>
  <path d="m12 7-3 4"></path>
  <path d="m15 11-3-4"></path>
  <circle cx="8" cy="15" r="1"></circle>
  <circle cx="16" cy="15" r="1"></circle>
</svg>
