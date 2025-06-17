import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      isr: {
        expiration: 60, // Cache for 60 seconds
      },
    }),
    alias: {
      $components: './src/components',
      $lib: './src/lib',
      $constants: './src/constants',
    },
  },
  vite: {
    server: {
      fs: {
        allow: ['../..']
      }
    }
  },
};

export default config;
