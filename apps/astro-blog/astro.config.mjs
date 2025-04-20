// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    root: './',
    vite: {
        envPrefix: ['PUBLIC_', 'VITE_'],
        server: { fs: { allow: ['..'] } },
        resolve: { preserveSymlinks: true },
    },
    site: 'https://{preview_domain}',
    output: 'static',
    integrations: [mdx(), sitemap()],
});
