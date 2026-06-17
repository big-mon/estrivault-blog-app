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

## Critical File Handling and Encoding Rules

Markdown files in this repository, especially under `content/blog/**/*.md`, are canonical authored content used by the Astro build. Treat them as source content, not generated artifacts.

Do not rewrite, normalize, reformat, or re-encode Markdown files unless the task explicitly asks for content edits.

### Safe move/copy/rename rules for Markdown

When moving, copying, renaming, or reorganizing Markdown files, use byte-preserving file operations.

Preferred tools:

- `git mv` for tracked file renames and moves
- `Move-Item`, `Copy-Item`, `Rename-Item` when using PowerShell strictly as file operations
- `mv` / `cp -p` when using a POSIX shell
- Python `shutil.move` / `shutil.copy2`
- Node.js `fs.renameSync` / `fs.copyFileSync`

Do not implement a move/copy/rename by reading Markdown as text and writing it back.

Do not use these patterns for Markdown move/copy/rename operations:

- `Get-Content ... | Set-Content ...`
- `cat file.md > new-file.md`
- `type file.md > new-file.md`
- `Out-File` to recreate Markdown files
- `Set-Content` to recreate Markdown files
- `Add-Content` for reconstructing Markdown files
- PowerShell redirection such as `>` or `>>` to recreate Markdown files
- Any text pipeline that depends on PowerShell's default encoding

Reading Markdown with `Get-Content`, `cat`, or `type` for inspection is acceptable. Redirecting or piping that output into a writer is not acceptable unless the task explicitly requires a content rewrite and the encoding is controlled.

### Encoding requirements

Markdown content must remain valid UTF-8.

Do not rely on Windows PowerShell 5.1 default encoding for Markdown writes.

If Markdown content must be edited:

- Prefer the agent's native patch/edit tool for small targeted edits.
- Prefer Python with `encoding="utf-8"` for scripted text edits.
- Prefer Node.js `fs` APIs with explicit UTF-8 handling for scripted text edits.
- If PowerShell is unavoidable, use PowerShell 7+ (`pwsh`) and explicitly specify UTF-8 encoding where supported.

Avoid broad text rewrites that can change encoding, line endings, frontmatter formatting, or Japanese text.

### Content preservation rules

For files under `content/blog/**/*.md`:

- Do not change body text unless explicitly requested.
- Do not change frontmatter fields such as `title`, `date`, `category`, `tags`, or `description` unless explicitly requested.
- Do not normalize whitespace, punctuation, line endings, or Markdown formatting unless explicitly requested.
- Do not run broad formatters over blog Markdown content unless the task specifically asks for formatting.
- A move-only or rename-only task must not produce body text changes.

Running repository-wide formatters such as `pnpm format` may be appropriate for source code, but do not use broad formatting as a substitute for moving, copying, or renaming Markdown content files.

### Required verification after Markdown file operations

After moving, copying, renaming, or editing Markdown files, check the diff before reporting success.

Run:

```bash
git status --short
git diff --stat
git diff --find-renames -- content/blog
```

For move-only or rename-only tasks, the diff should show only path changes. It must not show unexpected body, frontmatter, encoding, or line-ending changes.

If Markdown content was intentionally edited, inspect the specific file diff:

```bash
git diff --word-diff -- path/to/file.md
```

When there is any risk of encoding damage, validate that Markdown files are readable as UTF-8:

```bash
python - <<'PY'
from pathlib import Path

for path in Path("content/blog").rglob("*.md"):
    try:
        path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        raise SystemExit(f"Invalid UTF-8: {path}: {exc}")

print("All Markdown files under content/blog are valid UTF-8")
PY
```

If unexpected Markdown body changes appear, stop and restore the affected files before continuing.

## Development Commands

### Initial Setup (Automatic)

```bash
pnpm install                           # Installs dependencies and auto-builds packages
pnpm --filter astro-blog run setup:e2e # Installs Playwright Chromium when E2E is needed
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
pnpm --filter astro-blog run setup:e2e # Install Playwright Chromium for local E2E runs
pnpm --filter astro-blog test:e2e      # E2E tests (Playwright)
pnpm --filter astro-blog test          # Run all tests
```

### Single Test Execution

```bash
# Run specific E2E test
pnpm --filter astro-blog run setup:e2e
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
  - `/category/[category]/` - Category archive page 1
  - `/category/[category]/[page]/` - Category archive page 2 and later
  - `/tag/[tag]/` - Tag archive page 1
  - `/tag/[tag]/[page]/` - Tag archive page 2 and later
  - `/llms.txt` and `/llms-full.txt` - LLM-readable content endpoints
- Canonical URL policy:
  - Document pages omit the trailing slash, for example `/post/[slug]`
  - Archive pages keep the trailing slash, for example `/category/[category]/`
  - Archive page 1 omits the page number
- Redirects to canonical URLs are generated by `apps/astro-blog/scripts/generate-redirects.mjs` as `apps/astro-blog/public/_redirects` before `astro build`, then copied to `dist/_redirects`.
  This intentionally relies on Cloudflare Workers Static Assets `_redirects` support for HTTP 301 redirects because Astro static redirects do not cover hosting-level trailing slash canonicalization as real 301 responses. Generated `_redirects` output is ignored by git; update the script rather than editing the generated file.

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
- Treat Markdown files as published source content. Preserve encoding, frontmatter, body text, Japanese characters, and line endings unless the task explicitly asks for content changes.

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
