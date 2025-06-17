<script lang="ts">
  import GitHub from '../Icons/GitHub.svelte';
  import X from '../Icons/X.svelte';
  import Robot from '../Icons/Robot.svelte';

  const year = new Date().getFullYear();
</script>

<footer class="flex flex-col items-center gap-2 py-6 text-sm text-gray-500">
  <div class="flex gap-6">
    <a href="https://x.com/big_mon" target="_blank" aria-label="X (Twitter)">
      <X className="h-6 w-6 transition-opacity hover:opacity-80" />
    </a>

    <a href="https://github.com/big-mon" target="_blank" aria-label="GitHub">
      <GitHub className="h-6 w-6 transition-opacity hover:opacity-80" />
    </a>

    <a
      href="/llms.txt"
      target="_blank"
      aria-label="AI向け記事一覧"
      title="LLM-friendly content guide"
    >
      <Robot className="h-6 w-6 transition-opacity hover:opacity-80" />
    </a>
  </div>
  <p>© {year} Estrivault. All rights reserved.</p>
</footer>
