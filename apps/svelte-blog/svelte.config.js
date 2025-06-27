import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    prerender: {
      entries: ['*'],
      handleMissingId: 'warn',
      handleHttpError: 'warn',
    },
    alias: {
      $components: './src/components',
      $lib: './src/lib',
      $constants: './src/constants',
    },
  },
  vite: {
    server: {
      fs: {
        allow: ['../..'],
      },
    },
  },
};

export default config;
