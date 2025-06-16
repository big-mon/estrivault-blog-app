# ISR Migration Guide

This document outlines the migration from `@sveltejs/adapter-static` to `@sveltejs/adapter-vercel` with Incremental Static Regeneration (ISR) support.

## Changes Made

### 1. Package Dependencies

**Added:**
- `@sveltejs/adapter-vercel@^5.7.2` - Vercel adapter with ISR support

**Removed:**
- `@sveltejs/adapter-static@^3.0.8` - Static site generator adapter

### 2. SvelteKit Configuration (`apps/svelte-blog/svelte.config.js`)

**Before:**
```javascript
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    })
  }
};
```

**After:**
```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      // Image optimization configuration
      images: {
        sizes: [640, 828, 1200, 1920, 3840],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 300,
      }
    })
  }
};
```

### 3. ISR Configuration by Route Type

#### Blog Posts (`/post/[slug]`)
- **Cache Duration**: 1 hour (3600 seconds)
- **Rationale**: Individual blog posts are relatively static content that rarely changes after publication

#### Homepage (`/`)
- **Cache Duration**: 30 minutes (1800 seconds)
- **Rationale**: Main listing changes more frequently as new posts are added

#### Paginated Listings (`/[page]`)
- **Cache Duration**: 45 minutes (2700 seconds)
- **Rationale**: Older pages change less frequently than the homepage

#### Category Pages (`/category/[category]/[page]`)
- **Cache Duration**: 45 minutes (2700 seconds)
- **Rationale**: Category pages update when new posts are added to that category

#### Tag Pages (`/tag/[tag]/[page]`)
- **Cache Duration**: 45 minutes (2700 seconds)
- **Rationale**: Tag pages update when new posts are added with that tag

### 4. Common ISR Configuration

All routes include:
- **Bypass Token**: `process.env.PRERENDER_BYPASS_TOKEN` for development/testing
- **Allowed Query Parameters**: `['utm_source', 'utm_medium', 'utm_campaign', 'ref']` for analytics and social sharing

## Deployment Configuration

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "pnpm run build:all && pnpm --filter svelte-blog build",
  "outputDirectory": "apps/svelte-blog/.svelte-kit/output/client",
  "functions": {
    "apps/svelte-blog/.svelte-kit/output/server/index.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "PRERENDER_BYPASS_TOKEN": "@prerender_bypass_token"
  }
}
```

### Environment Variables

Set in Vercel dashboard or `.env.local`:
```
PRERENDER_BYPASS_TOKEN=your-32-character-or-longer-bypass-token-here
```

## ISR Benefits

### Performance
- **Fast Initial Load**: Cached static content served from CDN
- **Background Updates**: Content regenerates in background without blocking users
- **Reduced Server Load**: Only regenerates when cache expires

### Development Experience
- **Faster Builds**: No need to rebuild entire site for content changes
- **Selective Updates**: Only affected pages regenerate
- **Cache Bypassing**: Development/testing bypass with token

### Content Strategy
- **Flexible Cache Times**: Different cache durations for different content types
- **SEO Benefits**: Always serves content immediately while updating in background
- **Scalability**: Handles traffic spikes better than pure SSR

## Cache Strategy Reasoning

| Route Type | Cache Duration | Reasoning |
|------------|---------------|-----------|
| Blog Posts | 1 hour | Content rarely changes after publication |
| Homepage | 30 minutes | Frequently updated with new posts |
| Pagination | 45 minutes | Older pages change less frequently |
| Categories | 45 minutes | Updates when new posts added to category |
| Tags | 45 minutes | Updates when new posts added with tag |

## Usage Examples

### Normal Usage
```
https://your-site.vercel.app/post/my-blog-post
```

### Bypass Cache (Development/Testing)
```
https://your-site.vercel.app/post/my-blog-post?__prerender_bypass=your-token
```

## Migration Impact

### Build Output
- **Before**: Single `build/` directory with static files
- **After**: Hybrid output with `client/` (static) and `server/` (functions) directories

### Deployment
- **Before**: Static hosting (GitHub Pages, Netlify, etc.)
- **After**: Vercel platform with serverless functions

### Performance
- **Before**: Fully static, but requires full rebuilds
- **After**: Hybrid static/dynamic with background regeneration

## Monitoring and Debugging

### Vercel Functions
- Monitor function execution times in Vercel dashboard
- Set up alerts for function errors or timeouts

### Cache Behavior
- Use bypass token to test fresh content generation
- Monitor cache hit/miss ratios in Vercel analytics

### Content Updates
- Content updates trigger regeneration on next request after cache expiry
- Use Vercel's ISR purge API for immediate cache invalidation if needed

## Best Practices

1. **Content Strategy**: Plan cache durations based on content update frequency
2. **Environment Variables**: Always use environment variables for sensitive tokens
3. **Query Parameters**: Only allow necessary query parameters to prevent cache fragmentation
4. **Monitoring**: Set up monitoring for function performance and errors
5. **Testing**: Use bypass token to test content changes before cache expiry