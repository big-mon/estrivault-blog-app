# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Architecture

This is a **monorepo blog application** built with **Astro** and **TypeScript**. The application processes Markdown content from `content/blog/` into a static blog site.

### Key Components

**Apps:**

- `apps/astro-blog/` - Main Astro application for static site generation

**Packages:**

- `@estrivault/content-processor` - Core package that processes Markdown files using unified/remark/rehype pipeline with custom plugins for YouTube, Twitter, GitHub, and Amazon embeds
- `@estrivault/cloudinary-utils` - Image optimization utilities using Cloudinary

**Content Flow:**

1. Markdown files in `content/blog/` (organized by category)
2. Content processor parses frontmatter with gray-matter and processes content through unified pipeline
3. Custom plugins transform embeds and optimize images via Cloudinary
4. Astro generates static pages with routing for posts, categories, and tags

## Development Commands

### Initial Setup (Automatic)

```bash
pnpm install     # Installs dependencies, auto-builds packages, and installs Playwright Chromium via postinstall
```

### Development

```bash
pnpm dev                              # Smart dev start with auto-validation and hot reload
pnpm validate:workspace               # Check workspace health
```

### Production & Preview

```bash
pnpm --filter astro-blog build       # Build for production
pnpm --filter astro-blog preview     # Preview production build
```

### Build Commands

```bash
pnpm build                            # Full production build (packages + app)
pnpm build:packages                   # Build workspace packages only
pnpm build:packages:incremental       # Incremental TypeScript build
pnpm clean                            # Clean all build artifacts
```

### Quality Assurance

```bash
pnpm --filter astro-blog check       # Astro + TypeScript checking
pnpm --filter astro-blog lint        # ESLint + Prettier check
pnpm --filter astro-blog format      # Format code with Prettier
pnpm lint                             # Root-level ESLint check
pnpm format                           # Root-level Prettier format
pnpm format:check                     # Check formatting without changes
pnpm type-check                       # TypeScript check for all packages
```

### Testing

```bash
pnpm --filter astro-blog test:e2e    # E2E tests (Playwright)
pnpm --filter astro-blog test        # Run all tests
```

### Single Test Execution

```bash
# Run specific E2E test
pnpm --filter astro-blog test:e2e -- --grep "test name"
```

### Package Development

When modifying packages, build them individually:

```bash
pnpm --filter @estrivault/content-processor build
pnpm --filter @estrivault/cloudinary-utils build
pnpm --filter @estrivault/cloudinary-utils dev  # Watch mode for development
```

## Project Structure

### Workspace Packages

- `@estrivault/content-processor@0.1.0` - Core Markdown processing with unified/remark/rehype pipeline
- `@estrivault/cloudinary-utils@0.1.0` - Image optimization utilities using Cloudinary
- `astro-blog` - Main Astro application

### Key Dependencies

**Content Processing:**

- unified, remark-parse, remark-directive, remark-gfm for Markdown parsing
- rehype-raw, rehype-sanitize, rehype-stringify for HTML processing
- gray-matter for frontmatter parsing
- reading-time for estimated reading time calculation

**Astro App:**

- Astro 5.x
- TailwindCSS 4.x with typography plugin
- Vite 6.x for build tooling
- Playwright for E2E testing
- TypeScript with strict configuration

## Important Architecture Details

### Content Processing Pipeline

The `@estrivault/content-processor` uses a unified pipeline (`packages/content-processor/src/pipeline.ts`) that:

- Parses Markdown with remark-parse, remark-directive, remark-gfm
- Processes custom embeds (YouTube, Twitter, GitHub, Amazon) via custom remark plugins
- Converts to HTML with rehype, including image optimization via Cloudinary
- Handles link transformations

### Astro Routing

- Static output deployment via Cloudflare assets (`wrangler.toml` `assets.directory`)
- File-based routing with dynamic segments:
  - `/post/[slug]` - Individual posts
  - `/category/[category]/[page]` - Category filtering with pagination
  - `/tag/[tag]/[page]` - Tag filtering with pagination
  - `/llms.txt` and `/llms-full.txt` - LLM-readable content endpoints

### Smart Development Scripts

- `scripts/dev-helper.js` - Automated development startup with validation and package building
- `scripts/validate-workspace.js` - Workspace health check ensuring all packages and builds exist
- Uses `concurrently` for parallel development server management

### Monorepo Dependencies (Improved)

- Uses PNPM workspaces with automatic setup
- **Development**: TypeScript path mapping enables direct source file imports with hot reload
- **Production**: Astro app uses built packages from workspace
- **Auto-build**: `postinstall` hook ensures packages are built after `pnpm install`
- **Smart dev**: `pnpm dev` validates workspace and handles build dependencies automatically

### Git Hooks & Code Quality

- Husky integration for pre-commit hooks
- lint-staged for automatic code formatting on commit
- Comprehensive ESLint and Prettier configuration
- TypeScript strict mode across all packages

## Content Management

### Blog Posts Structure

- Markdown files in `content/blog/` organized by category folders (`tech/`, `finance/`, `hobbies/`, `opinions/`)
- Frontmatter with title, date, category, tags, and optional description
- Reading time calculated at 600 words per minute (configurable in processor)
- Support for custom embeds: YouTube, Twitter, GitHub, Amazon

### File Organization

- **Apps**: `apps/astro-blog/` (main Astro application)
- **Packages**: `packages/content-processor/` and `packages/cloudinary-utils/`
- **Content**: `content/blog/` with category-based folders
- **Scripts**: `scripts/` for development automation

## Key Architecture Patterns

### Package Dependencies

- Development uses TypeScript path mapping for direct source imports
- Production uses built packages from workspace
- Auto-build via `postinstall` hook ensures packages ready after install
- Incremental TypeScript builds for better performance

### Content Processing Flow

1. Markdown files parsed with gray-matter for frontmatter
2. Unified/remark pipeline processes content with custom plugins
3. Custom embeds transformed (YouTube, Twitter, GitHub, Amazon)
4. Images optimized via Cloudinary integration
5. HTML generated with rehype plugins
6. Static site generation via Astro
