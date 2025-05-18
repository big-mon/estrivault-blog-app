import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  outDir: 'dist',
  minify: true,
  treeshake: true,
  external: ['@cloudinary/url-gen'],
});
