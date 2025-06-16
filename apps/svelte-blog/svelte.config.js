import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // ISRとプリレンダリングの混在を許可
      runtime: 'nodejs20.x'
    }),
    alias: {
      $components: './src/components',
      $lib: './src/lib',
      $constants: './src/constants',
    },
  },
};

export default config;
