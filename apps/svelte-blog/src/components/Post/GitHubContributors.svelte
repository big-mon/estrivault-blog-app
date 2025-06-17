<script lang="ts">
  import { onMount } from 'svelte';
  import type { Contributor } from '../../routes/api/contributors/[...path]/+server';

  export let originalPath: string;

  let loading = true;
  let error: string | null = null;
  let contributors: Contributor[] = [];

  onMount(async () => {
    try {
      const response = await fetch(`/api/contributors/${originalPath}`);

      if (!response.ok) {
        if (response.status === 404) {
          error = 'ファイルが見つかりませんでした';
        } else if (response.status === 403) {
          error = 'GitHub APIの制限に達しました';
        } else {
          error = '貢献者情報の取得に失敗しました';
        }
        return;
      }

      contributors = await response.json();
    } catch (err) {
      console.error('Error fetching contributors:', err);
      error = '貢献者情報の取得に失敗しました';
    } finally {
      loading = false;
    }
  });

  function formatContributions(count: number): string {
    return count === 1 ? '1回の編集' : `${count}回の編集`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="contributors-section">
  <h3 class="contributors-title">
    <svg class="contributors-icon" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <path
        fill="currentColor"
        d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"
      />
    </svg>
    Authors & Editors
  </h3>

  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <span>読み込み中...</span>
    </div>
  {:else if error}
    <div class="error-state">
      <svg class="error-icon" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
        <path
          fill="currentColor"
          d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM7.25 8.25v-3a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0Zm1.5 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      <span>{error}</span>
    </div>
  {:else if contributors.length === 0}
    <div class="empty-state">
      <span>貢献者情報が見つかりませんでした</span>
    </div>
  {:else}
    <div class="contributors-list">
      {#each contributors as contributor}
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

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .loading-state {
    background-color: #f9fafb;
    color: #6b7280;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-state {
    background-color: #fef2f2;
    color: #dc2626;
  }

  .error-icon {
    flex-shrink: 0;
  }

  .empty-state {
    background-color: #f9fafb;
    color: #6b7280;
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
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  }

  .contributor-avatar-link:hover .contributor-avatar {
    border-color: #3b82f6;
    box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

</style>
