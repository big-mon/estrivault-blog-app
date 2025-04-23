# estrivault-blog-app

## 🛠 初回セットアップ手順（初めてクローンした場合）

```bash
git clone https://github.com/big-mon/estrivault-blog-app.git
cd estrivault-blog-app

npm install -g pnpm   # pnpm未導入の場合のみ
pnpm install          # 依存パッケージのインストール
pnpm build            # 依存パッケージ群をビルド（初回/依存追加時/パッケージ更新時は必須）
```

## 🔄 継続開発時・普段の開発

```bash
pnpm dev              # 開発サーバ起動（http://localhost:5173）
```

- Node.js >= 18（Vite と SvelteKit 推奨バージョンに合わせて）
- pnpm 利用前提（npm や yarn では未サポート or 不安定）
- モノレポ構成（apps/svelte-blog にアプリがある）
- pnpm dev が apps/svelte-blog をフィルタして起動する設定済み
- 依存パッケージや各種ユーティリティ（例: cloudinary-utils）はdist生成が必要なため、初回や依存追加・アップデート時はpnpm buildを忘れずに実行してください
