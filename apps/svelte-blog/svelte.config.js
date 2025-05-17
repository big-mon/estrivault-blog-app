import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: { 
    adapter: adapter(),
    alias: {
      '$components': './src/components',
      '$lib': './src/lib'
    }
  }
};

export default config;
