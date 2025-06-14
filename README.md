# estrivault-blog-app

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/big-mon/estrivault-blog-app)

**SvelteKit** と **TypeScript** で構築された**モノレポブログアプリケーション**。Markdownコンテンツを静的ブログサイトに変換し、YouTube、Twitter、GitHub、Amazonの埋め込み機能を持つアプリケーションです。

## 🏗️ アーキテクチャ

**モノレポ構成:**
- `apps/svelte-blog/` - メインのSvelteKitアプリケーション（静的サイト生成）
- `packages/content-processor/` - Markdown処理のコアパイプライン
- `packages/cloudinary-utils/` - 画像最適化ユーティリティ

**技術スタック:**
- **フロントエンド**: Svelte 5.x + SvelteKit 2.x + TailwindCSS 4.x
- **コンテンツ**: Markdown + frontmatter、unified/remark/rehype パイプライン
- **ビルド**: Vite 6.x、TypeScript、PNPMワークスペース
- **テスト**: Vitest（ユニット）、Playwright（E2E）
- **デプロイ**: `@sveltejs/adapter-static`による静的サイト生成

## 🛠 初回セットアップ手順（初めてクローンした場合）

```bash
git clone https://github.com/big-mon/estrivault-blog-app.git
cd estrivault-blog-app

# PNPM のインストール（未導入の場合）
npm install -g pnpm

# 依存関係のインストール
pnpm install

# 全パッケージのビルド（モノレポ必須）
pnpm run build:all

# 開発サーバーの起動
pnpm dev
```

## 🔄 継続開発時・普段の開発

```bash
pnpm dev              # 開発サーバ起動（http://localhost:5173）
```

## 🧪 テスト・品質管理

```bash
# TypeScript チェック
pnpm --filter svelte-blog check

# Lint & Format
pnpm --filter svelte-blog lint
pnpm --filter svelte-blog format

# テスト実行
pnpm --filter svelte-blog test:unit  # Unit tests (Vitest)
pnpm --filter svelte-blog test:e2e   # E2E tests (Playwright)
pnpm --filter svelte-blog test       # All tests
```

## 📦 パッケージ開発

```bash
# 個別パッケージのビルド
pnpm --filter @estrivault/content-processor build
pnpm --filter @estrivault/cloudinary-utils build

# 監視モードでの開発
pnpm --filter @estrivault/cloudinary-utils dev
```

## 🚀 本番ビルド・デプロイ

```bash
pnpm --filter svelte-blog build      # 本番ビルド
pnpm --filter svelte-blog preview    # 本番ビルドのプレビュー
```

## 💡 開発時の注意点

- **Node.js >= 18** 必須（Vite と SvelteKit 推奨バージョン）
- **PNPM** 利用前提（npm や yarn では未サポート）
- **モノレポ構成**: ワークスペース依存関係のため、初回や依存更新時は `pnpm run build:all` が必要
- **Content Pipeline**: Markdown ファイルは `content/blog/` に配置し、カテゴリ別にフォルダ分け
- **Image Optimization**: Cloudinary 連携による自動画像最適化
- **Custom Embeds**: YouTube、Twitter、GitHub、Amazon の埋め込み対応
