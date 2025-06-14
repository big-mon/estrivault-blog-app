# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **monorepo blog application** built with **SvelteKit** and **TypeScript**. The application processes Markdown content from `content/blog/` into a static blog site.

### Key Components

**Apps:**
- `apps/svelte-blog/` - Main SvelteKit application using static adapter for static site generation

**Packages:**
- `@estrivault/content-processor` - Core package that processes Markdown files using unified/remark/rehype pipeline with custom plugins for YouTube, Twitter, GitHub, and Amazon embeds
- `@estrivault/cloudinary-utils` - Image optimization utilities using Cloudinary
- `@estrivault/remark-cloudinary-images` - Remark plugin for Cloudinary integration

**Content Flow:**
1. Markdown files in `content/blog/` (organized by category)
2. Content processor parses frontmatter with gray-matter and processes content through unified pipeline
3. Custom plugins transform embeds and optimize images via Cloudinary
4. SvelteKit generates static pages with routing for posts, categories, and tags

## Development Commands

### Initial Setup (Required)
```bash
pnpm install        # Install dependencies
pnpm run build:all  # Build all packages (required for workspace dependencies)
```

### Development
```bash
pnpm dev                              # Start development server (http://localhost:5173)
pnpm --filter svelte-blog build      # Build for production  
pnpm --filter svelte-blog preview    # Preview production build
```

### Quality Assurance
```bash
pnpm --filter svelte-blog check      # TypeScript checking
pnpm --filter svelte-blog lint       # ESLint + Prettier check
pnpm --filter svelte-blog format     # Format code with Prettier
```

### Testing
```bash
pnpm --filter svelte-blog test:unit  # Unit tests (Vitest)
pnpm --filter svelte-blog test:e2e   # E2E tests (Playwright)
pnpm --filter svelte-blog test       # Run all tests
```

### Package Development
When modifying packages, build them individually:
```bash
pnpm --filter @estrivault/content-processor build
pnpm --filter @estrivault/cloudinary-utils build
pnpm --filter @estrivault/cloudinary-utils dev  # Watch mode for development
```

## Important Architecture Details

### Content Processing Pipeline
The `@estrivault/content-processor` uses a unified pipeline (`packages/content-processor/src/pipeline/pipeline.ts`) that:
- Parses Markdown with remark-parse, remark-directive, remark-gfm
- Processes custom embeds (YouTube, Twitter, GitHub, Amazon) via custom remark plugins
- Converts to HTML with rehype, including image optimization via Cloudinary
- Handles link transformations

### SvelteKit Routing
- Static site generation using `@sveltejs/adapter-static`
- File-based routing with dynamic segments:
  - `/post/[slug]` - Individual posts
  - `/category/[category]/[page]` - Category filtering with pagination
  - `/tag/[tag]/[page]` - Tag filtering with pagination

### Monorepo Dependencies
- Uses PNPM workspaces
- **Critical**: Always run `pnpm run build:all` after dependency changes or fresh clones
- SvelteKit app depends on built packages in workspace, not source files