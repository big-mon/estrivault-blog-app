// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    root: './',
    vite: {
        resolve: { preserveSymlinks: true },
    },
    site: 'https://{preview_domain}',
    output: 'static',
    integrations: [mdx(), sitemap()],
});
