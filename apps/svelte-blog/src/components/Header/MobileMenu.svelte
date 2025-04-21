<script lang="ts">
	import Nav from './Nav.svelte';
	import Title from './Title.svelte';
	import GitHub from '../Icons/GitHub.svelte';
	import X from '../Icons/X.svelte';

	export let pathname: string;
	export let onClose: () => void;
</script>

<div
	class="fixed inset-0 z-50 flex flex-col justify-between bg-white/70 p-6 shadow-md backdrop-blur-sm md:hidden"
>
	<!-- 上部：タイトルと閉じるボタン -->
	<div class="mb-6 flex items-center justify-between">
		<Title />
		<button class="text-gray-700" on:click={onClose} aria-label="Close menu">✕</button>
	</div>

	<!-- ナビゲーション -->
	<Nav {pathname} />

	<!-- フッターアイコン -->
	<div class="mt-8 flex justify-center gap-6">
		<a href="https://github.com/your-username" target="_blank" aria-label="GitHub">
			<GitHub className="h-6 w-6 hover:opacity-80" />
		</a>
		<a href="https://twitter.com/your-handle" target="_blank" aria-label="X">
			<X className="h-6 w-6 hover:opacity-80" />
		</a>
	</div>
</div>
