import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@content': path.resolve(__dirname, '../../content'),
    },
  },
});
