# estrivault-blog-app

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/big-mon/estrivault-blog-app)

## 🛠 初回セットアップ手順（初めてクローンした場合）

```bash
git clone https://github.com/big-mon/estrivault-blog-app.git
cd estrivault-blog-app

npm install -g pnpm   # pnpm未導入の場合のみ
pnpm install          # 依存パッケージのインストール
pnpm run build:all   # 全パッケージ・アプリを一括ビルド（モノレポ標準）

# 補足: 個別ビルドが必要な場合は下記コマンドも利用可能です
# pnpm --filter @estrivault/cloudinary-utils build
# pnpm --filter @estrivault/content-processor build
# pnpm --filter @estrivault/remark-cloudinary-images build
# pnpm --filter svelte-blog build

```

## 🔄 継続開発時・普段の開発

```bash
pnpm dev              # 開発サーバ起動（http://localhost:5173）
```

- Node.js >= 18（Vite と SvelteKit 推奨バージョンに合わせて）
- pnpm 利用前提（npm や yarn では未サポート or 不安定）
- モノレポ構成（apps/svelte-blog にアプリがある）
- pnpm dev が apps/svelte-blog をフィルタして起動する設定済み
- 依存パッケージや各種ユーティリティ（例: cloudinary-utils）は dist 生成が必要なため、初回や依存追加・アップデート時は pnpm build を忘れずに実行してください
