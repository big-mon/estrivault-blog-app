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
