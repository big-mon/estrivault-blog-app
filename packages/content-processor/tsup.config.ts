import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'], // ESM のみをサポート
  dts: false, // 型定義はTypeScriptのcomposite buildで生成
  clean: false, // tscが生成する.tsbuildinfoを削除しないようにするため
  bundle: true, // バンドルを有効化
  splitting: false, // Cloudflare Workers用に無効化
  minify: true, // 本番用に最適化
  treeshake: true, // 未使用コード削除
  sourcemap: false, // 本番用にfalse
  target: 'es2022', // Cloudflare Workers対応
  platform: 'browser', // Workers環境はbrowser扱い
  // Cloudflare Workers対応のため、必要最小限のみexternal
  external: [
    '@estrivault/cloudinary-utils', // workspace依存のみ外部化
    'gray-matter', // CloudflareでのYAML問題を回避
  ],
  // Cloudflare Workers互換性のためのpolyfill設定
  esbuildOptions(options) {
    options.conditions = ['worker', 'browser'];
  },
});
