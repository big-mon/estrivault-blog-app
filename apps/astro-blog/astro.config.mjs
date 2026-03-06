import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
    },
    ssr: {
      external: [
        '@estrivault/og-image-generator',
        '@resvg/resvg-js',
        '@resvg/resvg-js-linux-x64-gnu',
        '@resvg/resvg-js-linux-x64-musl',
        '@resvg/resvg-js-win32-x64-msvc',
      ],
    },
    resolve: {
      alias: {
        '@content': path.resolve('./../../content'),
        '$components': path.resolve('./src/components'),
        '$constants': path.resolve('./src/constants'),
        '$layouts': path.resolve('./src/layouts'),
        '$lib': path.resolve('./src/lib'),
      },
    },
  },
});
