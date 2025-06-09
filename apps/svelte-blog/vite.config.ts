import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  envDir: process.cwd(),
  optimizeDeps: {
    exclude: ['gray-matter', 'glob'],
  },
  ssr: {
    noExternal: ['gray-matter', 'glob'],
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
