import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],  // ESM のみをサポート
  dts: true,        // 型定義を生成
  clean: true,      // ビルド前に出力ディレクトリをクリーンアップ
  bundle: true,     // バンドルを有効化
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
    '@estrivault/cloudinary-utils'
  ]
});
