import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // 型定義はTypeScriptのcomposite buildで生成
  clean: false, // インクリメンタルビルドのためfalse
  sourcemap: true,
  target: 'es2022',
  outDir: 'dist',
  minify: true,
  treeshake: true,
  splitting: true, // コード分割を有効化
  keepNames: true, // minify最適化
  external: ['@cloudinary/url-gen'],
});
