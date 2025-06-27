<script lang="ts">
  import type { Contributor } from '$lib/types/github';

  export let contributors: Contributor[];

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<div class="flex flex-col items-start">
  <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-slate-600">
    <svg class="flex-shrink-0" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <path
        fill="currentColor"
        d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"
      ></path>
    </svg>
    Authors & Editors
  </h3>

  {#if contributors.length > 0}
    <div class="flex flex-wrap justify-start gap-2">
      {#each contributors as contributor (contributor.id)}
        <a
          href={contributor.html_url}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block no-underline transition-transform duration-200 ease-in-out hover:scale-110"
          title={`${contributor.login} - 最終編集: ${formatDate(contributor.last_commit_date)}`}
        >
          <img
            src={contributor.avatar_url}
            alt={`${contributor.login}のアバター`}
            class="h-12 w-12 rounded-full border-2 border-slate-200 shadow-sm transition-all duration-300 ease-out hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
            loading="lazy"
          />
        </a>
      {/each}
    </div>
  {/if}
</div>
