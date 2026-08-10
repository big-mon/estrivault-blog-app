# Development and verification

This guide is the progressive-disclosure companion to [AGENTS.md](../AGENTS.md). Script definitions
in `package.json` files are authoritative; inspect them before changing command composition.

## Setup

The repository pins pnpm in the root `packageManager` field. It has no root
`engines.node` support declaration, while the locked Astro 7.1.3 package requires Node `>=22.12.0`.
GitHub Actions uses Node 22.x; use a current Node 22 release to satisfy both constraints locally.

```bash
pnpm install
pnpm --filter astro-blog run setup:e2e # only when local Chromium E2E is required
```

Installation runs `postinstall`, which builds `@estrivault/cloudinary-utils`,
`@estrivault/content-processor`, and `@estrivault/og-image-generator`. Without global pnpm, invoke the
root-pinned executable with `npx --yes "$(node -p "require('./package.json').packageManager")" install`.

## Local development and builds

```bash
pnpm dev
pnpm build
pnpm --filter astro-blog preview
```

`pnpm dev` builds all three packages, then starts watchers for `cloudinary-utils` and
`og-image-generator` alongside Astro. `content-processor` is not watched; rebuild it after changing
it.

`pnpm build` incrementally builds all packages, generates Cloudflare redirect rules, and builds the
Astro static output. `wrangler.toml` uses this root command and publishes `apps/astro-blog/dist`.

## Select checks by change

For documentation, check only the changed docs and never run a repository-wide format write:

```bash
pnpm exec prettier --check AGENTS.md README.md docs/development.md
git diff --check
```

Adjust the explicit list to the actual diff and validate every changed relative link.

For Astro application, route, or presentation changes:

```bash
pnpm --filter astro-blog lint
pnpm --filter astro-blog check
pnpm --filter astro-blog build
pnpm --filter astro-blog test:e2e --grep "test name"
```

Install Chromium first and run the full `pnpm --filter astro-blog test:e2e` suite for cross-cutting
behavior. Playwright builds the app and serves it on `127.0.0.1:4173`. A pass is exit 0 with every
selected test passed and zero unexpected failures.

For workspace packages:

```bash
pnpm --filter @estrivault/content-processor build
pnpm --filter @estrivault/cloudinary-utils build
pnpm --filter @estrivault/og-image-generator build
pnpm --filter @estrivault/og-image-generator test
pnpm type-check # for cross-package type changes
```

The OGP tests import built `dist` output and must exit 0 with all Node tests passing.
`content-processor` and `cloudinary-utils` have no package test script; use build/type checks and the
relevant Astro check, build, or E2E coverage for consumer-visible changes.

## Local checks versus GitHub Actions

Pull-request CI uses Node 22.x and the pnpm version pinned by root `packageManager`. After a frozen
install, it runs exactly Astro lint,
Astro check, Playwright Chromium setup, and the full Astro E2E suite. It does not directly run root
lint, root format check, `pnpm type-check`, or the OGP unit tests. Run omitted checks locally when
their ownership area changes. A local pass does not prove GitHub Actions passed.

## OGP metadata: network and mutation boundary

`pnpm ogp:refresh` builds the content processor, scans eligible standalone URLs in `content/blog`
and `content/notes`, fetches remote OGP data, and normally writes `content/ogp-metadata.json`.
`pnpm ogp:refresh -- --dry-run` suppresses the file write but still makes outbound requests.
Normal Astro content rendering defaults to `cache-only`; setting `OGP_MODE=fetch` also crosses the
network boundary.

The separate `.github/workflows/refresh-ogp-metadata.yml` runs weekly and by manual dispatch with
content and pull-request write permissions. On metadata changes, it commits the JSON file,
force-with-lease pushes `codex/refresh-ogp-metadata`, and creates or updates a pull request to `main`.
Triggering it is an external repository mutation, not a CI verification step.

## Final review

Require all selected checks to exit 0 and tests to have zero unexpected failures, then run:

```bash
git status --short
git diff --stat
git diff --check
git diff
```

Confirm the diff is scoped, generated files are intentional, authored Markdown is unchanged unless
explicitly requested, and no server/watcher or temporary artifact remains. Report exact commands and
results, plus anything not verified.
