<script lang="ts">
  /**
   * ページネーションコンポーネント
   */
  import ChevronLeft from '$components/Icons/ChevronLeft.svelte';
  import ChevronRight from '$components/Icons/ChevronRight.svelte';

  // Props
  interface Props {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    maxVisible?: number;
  }

  const { currentPage, totalPages, baseUrl, maxVisible = 5 }: Props = $props();

  // ページリンクの生成
  function getPageUrl(page: number): string {
    if (page === 1) {
      return baseUrl === '/' ? '/' : baseUrl;
    }
    if (baseUrl === '/') {
      return `/${page}`;
    }
    return `${baseUrl}/${page}`;
  }

  // 表示するページ番号の配列を生成
  function getPageNumbers(): number[] {
    if (totalPages <= maxVisible) {
      // 全ページ数が表示最大数以下の場合は全て表示
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 表示するページ番号の範囲を計算
    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisible - 1, totalPages);

    // 終端に達した場合、開始位置を調整
    if (endPage === totalPages) {
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  const pageNumbers = getPageNumbers();
</script>

<nav aria-label="ページネーション" class="my-8 flex justify-center">
  <ul class="flex items-center space-x-1">
    <!-- 前のページへのリンク -->
    {#if currentPage > 1}
      <li>
        <a
          href={getPageUrl(currentPage - 1)}
          class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
          aria-label="前のページ"
        >
          <span class="sr-only">前のページ</span>
          <ChevronLeft size="5" />
        </a>
      </li>
    {:else}
      <li>
        <span
          class="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-gray-400"
          aria-disabled="true"
        >
          <span class="sr-only">前のページ</span>
          <ChevronLeft size="5" classNames="text-gray-400" />
        </span>
      </li>
    {/if}

    <!-- 最初のページへのリンク（現在のページが表示範囲の最初より大きい場合） -->
    {#if pageNumbers[0] && pageNumbers[0] > 1}
      <li>
        <a
          href={getPageUrl(1)}
          class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          aria-label="1ページ目"
        >
          1
        </a>
      </li>
      {#if pageNumbers[0] && pageNumbers[0] > 2}
        <li>
          <span class="flex h-10 w-10 items-center justify-center text-gray-500">...</span>
        </li>
      {/if}
    {/if}

    <!-- ページ番号 -->
    {#each pageNumbers as page (page)}
      <li>
        {#if page === currentPage}
          <span
            class="flex h-10 w-10 items-center justify-center rounded-md border border-blue-500 bg-blue-500 font-medium text-white"
            aria-current="page"
          >
            {page}
          </span>
        {:else}
          <a
            href={getPageUrl(page)}
            class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="{page}ページ目"
          >
            {page}
          </a>
        {/if}
      </li>
    {/each}

    <!-- 最後のページへのリンク（現在のページが表示範囲の最後より小さい場合） -->
    {#if pageNumbers.length > 0}
      {@const lastPageNumber = pageNumbers[pageNumbers.length - 1]}
      {#if lastPageNumber && lastPageNumber < totalPages}
        {#if lastPageNumber < totalPages - 1}
          <li>
            <span class="flex h-10 w-10 items-center justify-center text-gray-500">...</span>
          </li>
        {/if}
        <li>
          <a
            href={getPageUrl(totalPages)}
            class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="{totalPages}ページ目"
          >
            {totalPages}
          </a>
        </li>
      {/if}
    {/if}

    <!-- 次のページへのリンク -->
    {#if currentPage < totalPages}
      <li>
        <a
          href={getPageUrl(currentPage + 1)}
          class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
          aria-label="次のページ"
        >
          <span class="sr-only">次のページ</span>
          <ChevronRight size="5" />
        </a>
      </li>
    {:else}
      <li>
        <span
          class="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-gray-400"
          aria-disabled="true"
        >
          <span class="sr-only">次のページ</span>
          <ChevronRight size="5" classNames="text-gray-400" />
        </span>
      </li>
    {/if}
  </ul>
</nav>
