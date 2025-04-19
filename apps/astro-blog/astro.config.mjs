// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineCollection, z } from 'astro:content';

export const collections = {
  blog: defineCollection({
    schema: z.object({
      title: z.string(),
      publish: z.boolean().default(true),
      date: z.date(),
    }),
  }),
};

// https://astro.build/config
export default defineConfig({
  site: 'https://{preview_domain}',
  output: 'static',
  integrations: [mdx(), sitemap()],
});
