<script lang="ts">
  import Nav from './Nav.svelte';
  import Title from './Title.svelte';
  import GitHub from '../Icons/GitHub.svelte';
  import X from '../Icons/X.svelte';
  import Robot from '../Icons/Robot.svelte';
  import { fly } from 'svelte/transition';
  import { SOCIAL_LINK_GITHUB, SOCIAL_LINK_X } from '../../constants';

  export let pathname: string;
  export let onClose: () => void;

  async function handleNavigate() {
    onClose();
    // 画面遷移するまでスライドを閉じる待機時間
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
</script>

<!-- オーバーレイ（背景タップで閉じる） -->
<div class="fixed inset-0 z-50 bg-black/40 md:hidden" onclick={onClose} role="presentation">
  <!-- メニュー本体（中身クリックでは閉じない） -->
  <div
    class="flex h-full w-4/5 max-w-xs flex-col justify-between bg-white p-6 shadow-lg"
    transition:fly={{ x: -200, duration: 250 }}
    onclick={(e) => e.stopPropagation()}
    role="presentation"
  >
    <!-- 上部：Titleと閉じる -->
    <div class="mb-6 flex items-center justify-between">
      <Title />
      <button class="text-gray-700" onclick={onClose} aria-label="Close menu">✕</button>
    </div>

    <!-- ナビゲーション -->
    <Nav {pathname} onNavigate={handleNavigate} />

    <!-- フッターアイコン -->
    <div class="mt-8 flex justify-center gap-6">
      <a href={`https://twitter.com/${SOCIAL_LINK_X}`} target="_blank" aria-label="X">
        <X className="h-6 w-6 hover:opacity-80" />
      </a>
      <a href={`https://github.com/${SOCIAL_LINK_GITHUB}`} target="_blank" aria-label="GitHub">
        <GitHub className="h-6 w-6 hover:opacity-80" />
      </a>
      <a href="/llms.txt" target="_blank" aria-label="AI向け記事一覧">
        <Robot className="h-6 w-6 hover:opacity-80" />
      </a>
    </div>
  </div>
</div>
