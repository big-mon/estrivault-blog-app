import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const externalDependencies = [
  '@estrivault/og-image-generator',
  '@resvg/resvg-js',
  '@resvg/resvg-js-linux-x64-gnu',
  '@resvg/resvg-js-linux-x64-musl',
  '@resvg/resvg-js-win32-x64-msvc',
];

export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
    },
    build: {
      rollupOptions: {
        external: externalDependencies,
      },
    },
    ssr: {
      external: externalDependencies,
    },
    resolve: {
      alias: {
        '@content': path.resolve('./../../content'),
        $components: path.resolve('./src/components'),
        $constants: path.resolve('./src/constants'),
        $layouts: path.resolve('./src/layouts'),
        $lib: path.resolve('./src/lib'),
      },
    },
  },
});
