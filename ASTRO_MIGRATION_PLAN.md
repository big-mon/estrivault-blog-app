# estrivault-blog-app: Svelte 描画層を Astro に一括移行する計画（静的優先・Cloudflare継続）

## Progress (2026-03-03)
- ✅ `apps/astro-blog` を新規作成（`astro.config.mjs`, `package.json`, `tsconfig.json`, `public`, `src` 一式）
- ✅ 主要ルートを Astro で実装（`/`, `/[page]`, `/post/[slug]`, `/category/[category]/[page]`, `/tag/[tag]/[page]`）
- ✅ 補助エンドポイントを移植（`/sitemap.xml`, `/llms.txt`, `/llms-full.txt`）
- ✅ ルートコマンドを `astro-blog` 向けに切替（`package.json`, `scripts/dev-helper.js`, `tsconfig.json`, `wrangler.toml`）
- ✅ `_headers`, `robots.txt`, `icon.svg` を Astro 側 `public` へ移行
- ✅ 依存インストール完了（`pnpm install` 実施）
- ✅ `pnpm --filter @estrivault/content-processor build` 成功
- ✅ `pnpm --filter astro-blog build` 成功（289 pages built）
- ✅ `pnpm --filter astro-blog check` 成功（0 errors / 0 warnings）
- ✅ `pnpm --filter astro-blog test:e2e` 成功（Playwright: 1 passed）
- ✅ Cloudinary 未設定時に `content-processor` が例外終了しないよう修正（画像変換プラグインを no-op 化）
- ℹ️ 補足: この実行環境では `astro preview` のポート待受がサンドボックス内で制限されるため、E2E 実行時は権限昇格が必要

## Summary
- 目的は、Markdown 変換基盤（`@estrivault/content-processor`）を維持したまま、描画層を SvelteKit から Astro へ置換すること。
- 方針は `一括置換`、`静的優先`、`URL完全互換`、`Cloudflare継続`、`apps/astro-blog を新規追加`、`純Astro/TS`。
- 初回リリースではインタラクティブ機能を縮小し、記事表示・SEO・静的生成・既存URL互換を最優先にする。

## Public APIs / Interfaces / Types の変更点
- ワークスペースのアプリ実体を `svelte-blog` から `astro-blog` に切替（コマンドI/F変更）。
- ルートスクリプトの実行対象を `pnpm --filter astro-blog ...` に変更（`dev/build/type-check/test`）。
- 環境変数は `PUBLIC_CLOUDINARY_CLOUD_NAME` を継続し、Contributors APIの簡易化により `GITHUB_TOKEN` 依存を初回リリースから外す。
- デプロイ出力先を `apps/svelte-blog/.svelte-kit/cloudflare` から `apps/astro-blog/dist` に変更。

## 実装計画（Decision Complete）
1. ベースライン固定と移行対象の凍結を行う。編集対象は `package.json`、`wrangler.toml`、`tsconfig.json`、`scripts/dev-helper.js`。完了条件は、ルートコマンドが Astro 側に向く設計が確定していること。
2. `apps/astro-blog` を新規作成し、Astro静的サイト基盤を構築する。作成対象は `apps/astro-blog/package.json`, `astro.config.mjs`, `tsconfig.json`, `src/layouts`, `src/pages`, `public`。設定は `output: 'static'`、`trailingSlash: 'never'`、`vite.server.host = true`、Tailwind v4 を既存 `@tailwindcss/vite` 方針で接続する。完了条件は `pnpm --filter astro-blog dev/build/preview` が通ること。
3. フレームワーク非依存のコンテンツ取得層を Astro 側へ実装する。実装対象は `apps/astro-blog/src/lib/content.ts`（新規）と関連型。内容は `import.meta.glob` による `content/blog/**/*.{md,mdx}` 読み込み、`extractMetadata/processMarkdown` 呼び出し、カテゴリ・タグ正規化、ページネーション、slug解決。完了条件は Svelte の `getPosts/getPostBySlug` と同等のデータが取得できること。
4. URL完全互換でページ群を Astro へ移植する。実装対象は `src/pages/index.astro`, `src/pages/[page].astro`, `src/pages/post/[slug].astro`, `src/pages/category/[category]/[page].astro`, `src/pages/tag/[tag]/[page].astro`。`getStaticPaths` で全ページを静的生成し、404条件は現行同等（不正ページ番号/存在しないページ）にする。完了条件は既存URL集合でHTMLが生成されること。
5. SEO/メタ/補助エンドポイントを移植する。実装対象は `src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`, `src/layouts/BaseLayout.astro`。現行の canonical/OG/Twitter/構造化データを踏襲し、`<link rel="alternate" type="text/markdown">` と Cloudflare Web Analytics script をレイアウトへ移す。完了条件は `/sitemap.xml` と `/llms*.txt` が既存形式で取得できること。
6. UIコンポーネントを純Astro/TSで再実装する（静的優先）。対象は Header/Nav/Footer/PostCard/Pagination/PostHeader/PostBody/TOC/EditLink。初回で除外・簡略化する機能は `LoadingBar`、ViewTransition連動、TOCアクティブ追従、Twitter widgets 初期化、画像Lightbox、GitHub API contributors。Contributorsは「GitHub上で履歴を見る」固定リンクへ簡易置換する。完了条件は記事閲覧UXが成立し、主要DOM構造がE2Eで検証可能なこと。
7. 配信・静的アセット設定を切替える。編集対象は `wrangler.toml`、`apps/astro-blog/public/_headers`, `public/robots.txt`, `public/icon.svg`。`assets.directory` を `apps/astro-blog/dist` に変更し、`_headers` を Astro 出力に含める。完了条件は Cloudflare 向けビルド成果物が正しいディレクトリに出ること。
8. 開発体験と品質ゲートを Astro 向けに更新する。編集対象は `package.json`、`scripts/dev-helper.js`、`eslint.config.js`、`apps/astro-blog/playwright.config.ts`。`svelte-blog` 固定コマンドを `astro-blog` へ切替し、ESLint/Prettierは `.astro` 対応を追加する。完了条件は `pnpm dev/build/type-check/lint/test:e2e` が新アプリで実行可能なこと。
9. テストを移植・再定義する。対象は `apps/astro-blog/e2e/*.test.ts`。保持する検証はルーティング互換、メタタグ、記事一覧/記事詳細表示、カテゴリ/タグページ、sitemap/llms配信、レスポンシブ崩れなし。削除または後続フェーズ化する検証はライトボックス動作・Twitter widget動作・Svelteナビゲーション演出。完了条件は静的優先スコープでテストがグリーンになること。
10. ドキュメントと運用記述を更新し、Svelte実装をアーカイブ扱いにする。編集対象は `README.md`、`CLAUDE.md`、`apps/astro-blog/README.md`。`apps/svelte-blog` は直ちに削除せず「非推奨・未使用」と明記して短期保管し、安定後に削除する。完了条件は初見開発者が Astro 前提で迷わないこと。

## Test Cases / Scenarios
- `pnpm --filter @estrivault/content-processor build` と `pnpm --filter @estrivault/cloudinary-utils build` が成功する。
- `pnpm --filter astro-blog build` 成功、`dist` に全ルートが静的生成される。
- URL互換: `/`, `/2`, `/post/<existing-slug>`, `/category/tech/1`, `/tag/<existing-tag>/1` が200で表示される。
- エンドポイント互換: `/sitemap.xml`, `/llms.txt`, `/llms-full.txt` のContent-Typeと本文構造が期待通り。
- SEO互換: 記事ページで canonical/og/twitter/json-ld が出力される。
- 404検証: 存在しないページ番号・slugで404。
- Cloudflare検証: `wrangler.toml` の `assets.directory` から正しく配信される。
- 非機能確認: 初回リリースで除外したインタラクティブ機能が未実装であることを仕様として明示する（不具合扱いにしない）。

## Assumptions / Defaults
- `.github/workflows` は当該リポジトリに存在しないため、CIパイプライン変更はリポジトリ内スクリプト更新を優先し、外部CI設定は別途管理されている前提。
- ルーティングは現行完全互換を守るため、`/category/.../1` と `/tag/.../1` を維持する。
- Contributors は初回は API取得を行わず、簡易リンク表示で代替する。
- `apps/svelte-blog` は即削除せず、切替後の短期ロールバック用に残す。
- 2ndフェーズ（今回スコープ外）で、TOCアクティブ化・ライトボックス・Twitter動的埋込を必要に応じて段階再導入する。
