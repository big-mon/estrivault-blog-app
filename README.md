# estrivault-blog-app

## 🛠 開発手順

```bash
git clone https://github.com/big-mon/estrivault-blog-app.git
cd estrivault-blog-app

npm install -g pnpm   # pnpm未導入の場合のみ
pnpm install          # 依存パッケージのインストール
pnpm dev              # 開発サーバ起動（http://localhost:5173）
```

- Node.js >= 18（Vite と SvelteKit 推奨バージョンに合わせて）
- pnpm 利用前提（npm や yarn では未サポート or 不安定）
- モノレポ構成（apps/svelte-blog にアプリがある）
- pnpm dev が apps/svelte-blog をフィルタして起動する設定済み
