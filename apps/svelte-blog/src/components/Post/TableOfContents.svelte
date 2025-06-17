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

  // 現在アクティブな見出しかどうかを判定
  function isActive(headingId: string): boolean {
    return activeHeadingId === headingId;
  }

  onMount(() => {
    // より正確な見出し判定のため、スクロールイベントも併用
    const updateActiveHeading = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const triggerPoint = scrollY + windowHeight * 0.3; // 画面上部30%の位置

      let activeId = '';
      let minDistance = Infinity;

      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;

          // 見出しが triggerPoint を通過した場合
          if (elementTop <= triggerPoint) {
            const distance = triggerPoint - elementTop;
            if (distance < minDistance) {
              minDistance = distance;
              activeId = heading.id;
            }
          }
        }
      });

      if (activeId && activeId !== activeHeadingId) {
        activeHeadingId = activeId;
      }
    };

    // Intersection Observer の設定（補助的に使用）
    observer = new IntersectionObserver(
      () => {
        // エントリーの変化があった時に再計算
        updateActiveHeading();
      },
      {
        rootMargin: '-10% 0% -10% 0%',
        threshold: [0, 1]
      }
    );

    // 見出し要素を監視対象に追加
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    // スクロールイベントでもチェック（スロットル付き）
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveHeading, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 初期化時に一度実行
    setTimeout(updateActiveHeading, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });
</script>

{#if headings && headings.length > 0}
  <nav class="table-of-contents
    bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-2xl p-6 mb-8
    xl:sticky xl:top-24 xl:mb-0 xl:mt-16 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto
    xl:shadow-xl xl:shadow-gray-900/10">
    <h2 class="text-lg font-bold text-gray-900 mb-4">目次</h2>
    <ul class="space-y-2">
      {#each headings as heading}
        <li class={getIndentClass(heading.level)}>
          <a
            href="#{heading.id}"
            class="block py-1 transition-colors duration-200 {getTextSizeClass(heading.level)} {isActive(heading.id)
              ? 'text-gray-900 font-semibold bg-gray-100 rounded-md px-2 -mx-2'
              : 'text-gray-600 hover:text-gray-900'}"
          >
            {heading.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .table-of-contents a {
    text-decoration: none;
    display: block;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    margin: -0.25rem -0.5rem;
  }

  .table-of-contents a:hover {
    background-color: rgb(243 244 246 / 0.8);
  }
</style>
