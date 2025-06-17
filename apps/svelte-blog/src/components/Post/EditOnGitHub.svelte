<script lang="ts">
  import { GITHUB_REPO, MAIN_BRANCH } from '$lib/../constants';

  export let originalPath: string;

  $: editUrl = `${GITHUB_REPO}/edit/${MAIN_BRANCH}/${originalPath}`;
</script>

<div class="edit-on-github">
  <a href={editUrl} target="_blank" rel="noopener noreferrer" class="edit-link">
    <svg class="github-icon" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
    GitHubで編集を提案する
  </a>
  <p class="edit-description">
    間違いを見つけたら教えてください
  </p>
</div>

<style>
  .edit-on-github {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }


  .edit-description {
    margin: 0.75rem 0 0 0;
    color: #64748b;
    font-size: 0.875rem;
  }

  .edit-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border: 1px solid #334155;
    border-radius: 0.75rem;
    color: #f8fafc;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .edit-link:hover {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border-color: #475569;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    text-decoration: none;
  }

  .edit-link:active {
    transform: translateY(0);
  }

  .github-icon {
    flex-shrink: 0;
  }

  @media (min-width: 640px) {
    .edit-on-github {
      text-align: left;
      align-items: flex-start;
    }
  }
</style>
