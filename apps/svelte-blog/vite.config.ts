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
        manualChunks: {
          // 大きなライブラリを手動でチャンク分け
          shiki: ['shiki'],
          unified: ['unified', 'remark-parse', 'remark-rehype', 'rehype-stringify'],
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
