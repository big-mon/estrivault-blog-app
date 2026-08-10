# estrivault-blog-app

AstroとTypeScriptで構築したモノレポ構成の静的ブログアプリケーションです。Markdownの記事とノートを処理し、埋め込みや画像最適化、OGP画像生成を含むサイトを構築します。

## モノレポ構成

- `apps/astro-blog/` — Astroによる静的サイト本体
- `packages/content-processor/` — Markdown、frontmatter、埋め込みの処理
- `packages/cloudinary-utils/` — Cloudinary画像URLの生成と最適化
- `packages/og-image-generator/` — ブログ記事のOGP画像生成
- `content/blog/` — ブログ記事
- `content/notes/` — 短いノート記事

開発、検証、運用上の注意は [AGENTS.md](AGENTS.md) を参照してください。
