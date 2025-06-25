# Svelte Blog

**SvelteKit** と **TypeScript** で構築された静的ブログアプリケーションです。Markdownコンテンツから静的サイトを生成し、カスタム埋め込み機能を持つ高性能なブログを提供します。

## 特徴

- **SvelteKit 2.x** + **Svelte 5.x** による高性能フロントエンド
- **TailwindCSS 4.x** による美しいデザイン
- **TypeScript** による型安全な開発
- **Markdown** ベースのコンテンツ管理
- **カスタム埋め込み**: YouTube、Twitter、GitHub、Amazon
- **静的サイト生成** (SSG) による高速配信
- **レスポンシブデザイン**
- **カテゴリ・タグ機能**
- **ページネーション**
- **SEO最適化**

## 開発環境

### 必要な環境

- **Node.js** >= 18
- **PNPM** (推奨)

### 開発サーバーの起動

```bash
# ルートディレクトリから（推奨）
pnpm dev

# または、このアプリのみ
pnpm --filter svelte-blog dev
```

### 本番ビルド

```bash
pnpm --filter svelte-blog build
```

### プレビュー

```bash
pnpm --filter svelte-blog preview
```

## テスト

### ユニットテスト

```bash
pnpm --filter svelte-blog test:unit
```

### E2Eテスト

```bash
pnpm --filter svelte-blog test:e2e
```

### 全テスト実行

```bash
pnpm --filter svelte-blog test
```

## コード品質

### TypeScriptチェック

```bash
pnpm --filter svelte-blog check
```

### リント

```bash
pnpm --filter svelte-blog lint
```

### フォーマット

```bash
pnpm --filter svelte-blog format
```

## プロジェクト構成

### ディレクトリ構造

```
src/
├── app.html              # HTMLテンプレート
├── app.css               # グローバルスタイル
├── app.d.ts              # 型定義
├── components/           # 再利用可能なコンポーネント
│   ├── Footer/           # フッターコンポーネント
│   ├── Header/           # ヘッダーコンポーネント
│   ├── Icons/            # アイコンコンポーネント
│   ├── LoadingBar/       # ローディングバー
│   ├── Pagination/       # ページネーション
│   ├── Post/             # 記事関連コンポーネント
│   └── PostCard/         # 記事カードコンポーネント
├── constants/            # 定数定義
├── lib/                  # ユーティリティ・ライブラリ
│   ├── actions/          # Svelteアクション
│   ├── services/         # 外部サービス連携
│   ├── types/            # 型定義
│   └── utils.ts          # ユーティリティ関数
└── routes/               # SvelteKitルーティング
    ├── +layout.svelte    # レイアウトコンポーネント
    ├── +page.svelte      # ホームページ
    ├── post/[slug]/      # 記事詳細ページ
    ├── category/         # カテゴリページ
    ├── tag/              # タグページ
    └── api/              # APIエンドポイント
```

### 主要なコンポーネント

#### Post関連

- `PostCard.svelte`: 記事一覧カード
- `Post/Header.svelte`: 記事ヘッダー
- `Post/PostBody.svelte`: 記事本文
- `Post/TableOfContents.svelte`: 目次
- `Post/GitHubContributors.svelte`: GitHub貢献者表示

#### ナビゲーション

- `Header/Nav.svelte`: ナビゲーション
- `Header/MobileMenu.svelte`: モバイルメニュー
- `Pagination/Pagination.svelte`: ページネーション

#### アイコン

- `Icons/`: 各種SVGアイコンコンポーネント

## ルーティング

### ページ構成

- `/` - ホームページ（記事一覧）
- `/[page]` - 記事一覧（ページネーション）
- `/post/[slug]` - 記事詳細
- `/category/[category]/[page]` - カテゴリ別記事一覧
- `/tag/[tag]/[page]` - タグ別記事一覧

### API エンドポイント

- `/api/contributors/[...path]` - GitHub貢献者情報
- `/sitemap.xml` - サイトマップ
- `/llms.txt` - AI用メタデータ
- `/llms-full.txt` - AI用詳細メタデータ

## 依存関係

### 主要な依存関係

- **@sveltejs/kit**: SvelteKitフレームワーク
- **@sveltejs/adapter-vercel**: Vercelデプロイメントアダプター
- **@estrivault/content-processor**: Markdownコンテンツ処理
- **tailwindcss**: CSSフレームワーク
- **@tailwindcss/typography**: タイポグラフィプラグイン

### 開発依存関係

- **vite**: 高速ビルドツール
- **vitest**: ユニットテストフレームワーク
- **@playwright/test**: E2Eテストフレームワーク
- **svelte-check**: TypeScriptチェック
- **sass-embedded**: Sassサポート

## デプロイメント

### Vercelデプロイ

このアプリケーションは `@sveltejs/adapter-vercel` を使用してVercelに最適化されています。

### 静的サイト生成

ビルド時に全ページが静的に生成され、高速な配信が可能です。

## 開発のヒント

### コンテンツ管理

Markdownファイルは `content/blog/` ディレクトリに配置し、カテゴリ別にフォルダ分けします。

### カスタム埋め込み

```markdown
::youtube[video-id]
::twitter[tweet-url]
::github[repo-url]
::amazon[product-id]
```

### スタイリング

TailwindCSSを使用し、カスタムスタイルは `src/components/Post/style/` に配置します。

## ライセンス

MIT
