import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  optimizeDeps: {
    exclude: ['gray-matter', 'glob'],
  },
  ssr: {
    noExternal: ['glob'],
  },
  server: {
    host: true,
    fs: {
      allow: ['..', '../..', '../../content']
    }
  },
  resolve: {
    alias: {
      '@content': path.resolve(__dirname, '../../content')
    }
  }
});
