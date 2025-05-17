import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',  // Node.js 環境でテストを実行
    include: ['**/*.test.ts'],  // テストファイルのパターン
    coverage: {
      provider: 'v8',  // カバレッジプロバイダー
      reporter: ['text', 'json', 'html'],  // カバレッジレポートの形式
      exclude: [  // カバレッジから除外するファイル
        '**/*.test.ts',
        '**/test/**',
        '**/__mocks__/**',
        '**/dist/**',
        '**/node_modules/**',
      ],
    },
  },
  resolve: {
    alias: {
      // 必要に応じてエイリアスを設定
      '@': resolve(__dirname, './src'),
    },
  },
});
