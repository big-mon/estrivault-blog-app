<script lang="ts">
  import type { HeadingInfo } from '@estrivault/content-processor';

  export let headings: HeadingInfo[];

  // 見出しレベルに応じたインデントクラスを取得
  function getIndentClass(level: number): string {
    switch (level) {
      case 1: return 'ml-0';
      case 2: return 'ml-0';
      case 3: return 'ml-4';
      case 4: return 'ml-8';
      case 5: return 'ml-12';
      case 6: return 'ml-16';
      default: return 'ml-0';
    }
  }

  // 見出しレベルに応じたテキストサイズクラスを取得
  function getTextSizeClass(level: number): string {
    switch (level) {
      case 1: return 'text-base font-semibold';
      case 2: return 'text-base font-semibold';
      case 3: return 'text-sm';
      case 4: return 'text-sm';
      case 5: return 'text-xs';
      case 6: return 'text-xs';
      default: return 'text-sm';
    }
  }
</script>

{#if headings && headings.length > 0}
  <nav class="table-of-contents 
    bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8
    xl:sticky xl:top-8 xl:mb-0 xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto
    xl:shadow-lg">
    <h2 class="text-lg font-bold text-gray-800 mb-3">目次</h2>
    <ul class="space-y-2">
      {#each headings as heading}
        <li class={getIndentClass(heading.level)}>
          <a 
            href="#{heading.id}" 
            class="block py-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 {getTextSizeClass(heading.level)}"
          >
            {heading.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .table-of-contents {
    /* スムーズスクロール用のスタイル */
  }
  
  .table-of-contents a {
    text-decoration: none;
    display: block;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    margin: -0.25rem -0.5rem;
  }
  
  .table-of-contents a:hover {
    background-color: rgb(243 244 246);
  }
</style>