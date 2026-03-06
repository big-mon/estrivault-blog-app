import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: false,
  sourcemap: true,
  target: 'es2022',
  outDir: 'dist',
  minify: true,
  treeshake: true,
  splitting: false,
  platform: 'node',
  keepNames: true,
  external: ['@resvg/resvg-js', 'react', 'satori'],
  loader: {
    '.otf': 'file',
  },
});
