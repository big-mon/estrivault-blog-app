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

<div class="contributors-section">
  <h3 class="contributors-title">
    <svg class="contributors-icon" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <path
        fill="currentColor"
        d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"
      ></path>
    </svg>
    Authors & Editors
  </h3>

  {#if contributors.length > 0}
    <div class="contributors-list">
      {#each contributors as contributor (contributor.id)}
        <a
          href={contributor.html_url}
          target="_blank"
          rel="noopener noreferrer"
          class="contributor-avatar-link"
          title={`${contributor.login} - 最終編集: ${formatDate(contributor.last_commit_date)}`}
        >
          <img
            src={contributor.avatar_url}
            alt={`${contributor.login}のアバター`}
            class="contributor-avatar"
            loading="lazy"
          />
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .contributors-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .contributors-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
  }

  .contributors-icon {
    flex-shrink: 0;
  }

  .contributors-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-start;
  }

  .contributor-avatar-link {
    display: inline-block;
    text-decoration: none;
    transition: transform 0.2s ease;
  }

  .contributor-avatar-link:hover {
    transform: scale(1.1);
  }

  .contributor-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid #e2e8f0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      0 1px 2px -1px rgba(0, 0, 0, 0.1);
  }

  .contributor-avatar-link:hover .contributor-avatar {
    border-color: #3b82f6;
    box-shadow:
      0 8px 25px -5px rgba(59, 130, 246, 0.25),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
</style>
