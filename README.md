# estrivault-blog-app

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/big-mon/estrivault-blog-app) ![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/big-mon/estrivault-blog-app?utm_source=oss&utm_medium=github&utm_campaign=big-mon%2Festrivault-blog-app&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

**Astro** と **TypeScript** で構築された**モノレポブログアプリケーション**。Markdownコンテンツを静的ブログサイトに変換し、YouTube、Twitter、GitHub、Amazonの埋め込み機能を持つアプリケーションです。

## 🏗️ アーキテクチャ

**モノレポ構成:**

- `apps/astro-blog/` - メインのAstroアプリケーション（静的サイト生成）
- `packages/content-processor/` - Markdown処理のコアパイプライン
- `packages/cloudinary-utils/` - 画像最適化ユーティリティ
- `packages/og-image-generator/` - ブログ記事向け OGP 画像生成ユーティリティ

**技術スタック:**

- **フロントエンド**: Astro 5.x + TailwindCSS 4.x
- **コンテンツ**: Markdown + frontmatter、unified/remark/rehype パイプライン
- **ビルド**: Vite 6.x、TypeScript、PNPMワークスペース
- **テスト**: Playwright（E2E）
- **デプロイ**: Cloudflare Assets（`wrangler.toml`）

## 🛠 初回セットアップ手順（初めてクローンした場合）

```bash
git clone https://github.com/big-mon/estrivault-blog-app.git
cd estrivault-blog-app

# PNPM のインストール（未導入の場合）
npm install -g pnpm

# 依存関係のインストール
pnpm install

# E2E テストを実行する場合のみ Playwright Chromium をセットアップ
pnpm --filter astro-blog run setup:e2e

# 全パッケージのビルド（モノレポ必須）
pnpm run build

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
pnpm --filter astro-blog check

# Lint & Format
pnpm --filter astro-blog lint
pnpm --filter astro-blog format

# テスト実行
pnpm --filter astro-blog run setup:e2e   # ローカルで E2E を実行する前に Playwright Chromium を導入
pnpm --filter astro-blog test:e2e   # E2E tests (Playwright)
pnpm --filter astro-blog test       # All tests
```

## 📦 パッケージ開発

```bash
# 個別パッケージのビルド
pnpm --filter @estrivault/content-processor build
pnpm --filter @estrivault/cloudinary-utils build
pnpm --filter @estrivault/og-image-generator build

# 監視モードでの開発
pnpm --filter @estrivault/cloudinary-utils dev
pnpm --filter @estrivault/og-image-generator dev
```

## 🚀 本番ビルド・デプロイ

```bash
pnpm --filter astro-blog build      # 本番ビルド
pnpm --filter astro-blog preview    # 本番ビルドのプレビュー
```

## 💡 開発時の注意点

- **Node.js >= 18** 必須（Vite と Astro 推奨バージョン）
- **PNPM** 利用前提（npm や yarn では未サポート）
- **モノレポ構成**: ワークスペース依存関係のため、初回や依存更新時は `pnpm run build` が必要
- **Content Pipeline**: Markdown ファイルは `content/blog/` に配置し、カテゴリ別にフォルダ分け
- **Image Optimization**: Cloudinary 連携による自動画像最適化
- **Custom Embeds**: YouTube、Twitter、GitHub、Amazon の埋め込み対応
