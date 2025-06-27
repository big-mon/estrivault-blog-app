<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { HeadingInfo } from '@estrivault/content-processor';

  interface Props {
    headings: HeadingInfo[];
  }

  const { headings }: Props = $props();

  let activeHeadingId = $state<string>('');
  let observer: IntersectionObserver;

  // 見出しレベルに応じたインデントクラスを取得
  function getIndentClass(level: number): string {
    switch (level) {
      case 1:
        return 'ml-0';
      case 2:
        return 'ml-0';
      case 3:
        return 'ml-4';
      case 4:
        return 'ml-8';
      case 5:
        return 'ml-12';
      case 6:
        return 'ml-16';
      default:
        return 'ml-0';
    }
  }

  // 見出しレベルに応じたテキストサイズクラスを取得
  function getTextSizeClass(level: number): string {
    switch (level) {
      case 1:
        return 'text-base font-semibold';
      case 2:
        return 'text-base font-semibold';
      case 3:
        return 'text-sm';
      case 4:
        return 'text-sm';
      case 5:
        return 'text-xs';
      case 6:
        return 'text-xs';
      default:
        return 'text-sm';
    }
  }

  // 現在アクティブな見出しかどうかを判定
  function isActive(headingId: string): boolean {
    return activeHeadingId === headingId;
  }

  onMount(() => {
    // Intersection Observer のみを使用して効率的にアクティブ見出しを判定
    observer = new IntersectionObserver(
      (entries) => {
        // ビューポート内にある見出しを収集
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length > 0) {
          // 最上部にある見出しをアクティブとする
          const topEntry = visibleEntries.reduce((top, entry) => {
            return entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top;
          });

          const newActiveId = topEntry.target.id;
          if (newActiveId !== activeHeadingId) {
            activeHeadingId = newActiveId;
          }
        } else {
          // 見出しが見えない場合はアクティブ状態をクリア
          activeHeadingId = '';
        }
      },
      {
        rootMargin: '-10% 0% -70% 0%', // 上部10-30%の範囲で判定（より広い検出範囲）
        threshold: 0,
      },
    );

    // 見出し要素を監視対象に追加
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });
</script>

{#if headings && headings.length > 0}
  <nav
    class="table-of-contents
    mb-8 rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50 p-6
    xl:sticky xl:top-24 xl:mb-0 xl:mt-16 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto
    xl:shadow-xl xl:shadow-gray-900/10"
  >
    <h2 class="mb-4 text-lg font-bold text-gray-900">目次</h2>
    <ul class="space-y-2">
      {#each headings as heading (heading.id)}
        <li class={getIndentClass(heading.level)}>
          <a
            href="#{heading.id}"
            class="block py-1 transition-colors duration-200 {getTextSizeClass(heading.level)} {(
              isActive(heading.id)
            ) ?
              '-mx-2 rounded-md bg-gray-100 px-2 font-semibold text-gray-900'
            : 'text-gray-600 hover:text-gray-900'}"
          >
            {heading.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}
