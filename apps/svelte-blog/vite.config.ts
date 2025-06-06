import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  envDir: process.cwd(),
  ssr: {
    noExternal: ['fast-glob'],
  },
});
