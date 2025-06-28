import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@content': path.resolve(__dirname, '../../content'),
    },
  },
  build: {
    rollupOptions: {
      cache: true, // Rollupキャッシュを有効化
      output: {
        manualChunks: (id) => {
          // Shiki関連の依存関係
          if (id.includes('shiki') || id.includes('@shikijs')) {
            return 'shiki';
          }

          // unified/remark/rehypeエコシステム
          if (
            id.includes('unified') ||
            id.includes('remark-') ||
            id.includes('rehype-') ||
            id.includes('mdast') ||
            id.includes('hast') ||
            id.includes('micromark')
          ) {
            return 'markdown-processor';
          }

          // Tailwind CSS関連
          if (id.includes('tailwindcss') || id.includes('@tailwindcss')) {
            return 'tailwind';
          }

          // SvelteKit/Svelte関連
          if (id.includes('@sveltejs') || id.includes('svelte/')) {
            return 'sveltekit';
          }

          // Node modules内の大きなライブラリ
          if (id.includes('node_modules')) {
            if (
              id.includes('gray-matter') ||
              id.includes('reading-time') ||
              id.includes('js-yaml')
            ) {
              return 'markdown-utils';
            }
            return 'vendor';
          }

          // デフォルト: undefined を返す（自動チャンキング）
          return undefined;
        },
      },
    },
    target: 'es2022', // より新しいターゲットで最適化
    reportCompressedSize: false, // gzipサイズ計算をスキップして高速化
  },
  define: {
    // 環境変数の最適化
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  optimizeDeps: {
    // 依存関係の事前バンドル
    include: ['@estrivault/content-processor', '@estrivault/cloudinary-utils'],
    exclude: ['fsevents'], // 不要な依存関係を除外
  },
});
