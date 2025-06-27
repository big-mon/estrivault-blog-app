import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'], // ESM のみをサポート
  dts: {
    entry: './src/index.ts',
  }, // 型定義を生成
  clean: false, // インクリメンタルビルドのためfalse
  bundle: true, // バンドルを有効化
  splitting: true, // コード分割を有効化
  keepNames: true, // minify最適化
  sourcemap: true, // ソースマップ生成
  // 外部ライブラリを指定（peerDependenciesや使用するライブラリ）
  external: [
    'unist-util-visit',
    'remark-parse',
    'remark-rehype',
    'rehype-stringify',
    'rehype-raw',
    'rehype-sanitize',
    'gray-matter',
    'glob',
    'vfile',
    'unified',
    'reading-time',
    'hast-util-sanitize',
    'mdast',
    'remark-directive',
    '@estrivault/cloudinary-utils',
  ],
});
