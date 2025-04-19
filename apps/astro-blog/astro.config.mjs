import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://{preview_domain}',
  output: 'static',
});
