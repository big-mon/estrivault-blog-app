# AGENTS.md

This is the repository-wide router for coding agents. Read executable configuration before prose:
root and workspace `package.json` files, `pnpm-workspace.yaml`, the relevant source or script, and
the matching workflow under `.github/workflows/`. Command composition remains authoritative in
`package.json`; see [docs/development.md](docs/development.md) for setup, check selection, and CI
semantics.

## Repository map and ownership

- `apps/astro-blog/`: Astro static-site application, routes, components, shared presentation, and
  generated post OGP endpoints.
- `packages/content-processor/`: trusted Markdown/frontmatter processing and embed transformations.
- `packages/cloudinary-utils/`: Cloudinary URL helpers (`t_body` named transformation).
- `packages/og-image-generator/`: Satori/resvg post-image generation, fonts, title layout, and its
  Node test suite.
- `content/blog/` and `content/notes/`: canonical authored Markdown. These are source content, not
  generated fixtures.
- `content/ogp-metadata.json`: generated/cache-like metadata maintained by the OGP refresh command
  and scheduled workflow; it is not authored article text.
- `scripts/`: pnpm usage enforcement and OGP metadata refresh.
- `apps/astro-blog/scripts/generate-redirects.mjs`: authoritative generator for the ignored
  `apps/astro-blog/public/_redirects` file.
- `worker/`: Cloudflare Worker entry (`index.mjs`) for Accept-based Markdown negotiation and
  response headers; tested by `pnpm test:worker`.
- `wrangler.toml`: Cloudflare Workers Static Assets build and deployment configuration (`main` +
  `[assets]`).

## Hard safety boundaries

### Preserve authored Markdown byte-for-byte unless content editing is explicit

The files under `content/blog/**/*.{md,mdx}` and `content/notes/**/*.{md,mdx}` contain published,
often Japanese, source content. Do not rewrite, normalize, reformat, re-encode, or change their
frontmatter/body unless the task explicitly requests that content change. Do not run repository-wide
format-write commands such as `pnpm format`; they include authored Markdown.

For move/copy/rename-only work, use byte-preserving file operations: `git mv`, `mv`, `cp -p`,
`Move-Item`/`Copy-Item`/`Rename-Item`, Python `shutil`, or Node filesystem copy/rename APIs. Never
reconstruct Markdown through `Get-Content | Set-Content`, `Out-File`, `Add-Content`, `cat >`,
`type >`, or PowerShell redirection. Windows PowerShell 5.1 default encoding is unsafe for these
files.

If content editing is explicitly requested, prefer a targeted patch. For scripted edits, specify
UTF-8 explicitly in Python, Node.js, or PowerShell 7+. Avoid broad rewrites that alter line endings,
frontmatter formatting, whitespace, punctuation, or unrelated Japanese text.

After any authored Markdown operation, inspect:

```bash
git status --short
git diff --stat
git diff --find-renames -- content/blog content/notes
```

For intentional edits, also run `git diff --word-diff -- path/to/file.md`. If encoding may have
changed, validate both content roots as UTF-8. Stop and restore unexpected body/frontmatter changes
before continuing.

### Treat side-effecting commands explicitly

- `pnpm install` runs `postinstall` and builds all three workspace packages.
- `pnpm dev` builds all three workspace packages, then starts the Cloudinary and OGP generator
  watchers plus the Astro server; `content-processor` is not watched.
- `pnpm build` generates `apps/astro-blog/public/_redirects`, builds Astro, then
  `apps/astro-blog/scripts/generate-markdown-artifacts.mjs` writes public `index.md` artifacts into
  `apps/astro-blog/dist`.
- `pnpm ogp:refresh` reads authored Markdown, makes outbound requests for eligible URLs, and normally
  rewrites `content/ogp-metadata.json`. Use `--dry-run` when no write is intended, but it still
  performs network fetches for URLs selected for refresh.
- `.github/workflows/refresh-ogp-metadata.yml` is not a read-only CI check. On schedule or manual
  dispatch it can update metadata, force-with-lease push `codex/refresh-ogp-metadata`, and create or
  edit a pull request using write permissions.
- Do not commit, push, deploy, or trigger workflows unless the user explicitly authorizes it.

## Architecture invariants

- Posts and notes load through `apps/astro-blog/src/lib/content.ts` and share
  `@estrivault/content-processor`'s `processMarkdown()` path. Investigate consumers and CSS before
  splitting processor behavior.
- Normal Astro content rendering defaults to OGP `cache-only` mode and reads
  `content/ogp-metadata.json`. Treat `OGP_MODE=fetch` and `pnpm ogp:refresh` as explicit network
  boundaries rather than ordinary build behavior.
- Repository-authored Markdown is trusted. `rehypeRaw` is intentionally enabled and processed HTML
  is rendered with Astro `set:html`. Do not add sanitization or expose a sanitize-schema option
  without an explicit trust-model change and tests.
- Shared Markdown presentation belongs in `apps/astro-blog/src/app.css` and should cover both
  `.article-body` and `.note-body`.
- Note frontmatter is intentionally limited to `title`, `publishedAt`, and `tags`. Notes are
  independent mini-articles, and body media belongs in Markdown.
- Note cards remain normal links. Modal behavior is progressive enhancement; direct note URLs must
  remain standalone pages. Preserve dialog semantics, Escape/outside-click close, focus handling,
  scroll locking, and focus restoration.
- Production is a Cloudflare Worker plus Static Assets: `wrangler.toml` sets `main` to
  `worker/index.mjs` with `run_worker_first = true`, and `[assets].directory` is
  `apps/astro-blog/dist`. That directory holds the Astro HTML build (including prerendered
  `llms.txt` / `sitemap.md` routes) **and** build-script Markdown artifacts (`index.md`,
  `post/<slug>/index.md`, `notes/<slug>/index.md`). Do not treat the Worker or
  Markdown artifacts as optional when changing build or routing. Document URLs omit a trailing slash;
  archive URLs keep one, and archive page 1 omits its page number. Change canonical redirect behavior
  in `generate-redirects.mjs`, never in the ignored generated `_redirects` file.
- Rebuild before visually verifying source changes against a preview server, because preview serves
  built output.

## Verification and completion

Use the smallest relevant checks, then widen for cross-cutting changes. Command lists, pull-request
CI job steps, local-vs-CI gaps, and completion criteria are defined only in
[docs/development.md](docs/development.md) (sections **Select checks by change**, **Local checks
versus GitHub Actions**, and **Final review**).
