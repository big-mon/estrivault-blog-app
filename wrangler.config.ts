import { defineWranglerConfig } from 'wrangler/experimental-config';

export default defineWranglerConfig({
  types: {
    generate: false,
  },
  assetsDirectory: 'apps/astro-blog/dist',
});
