# estrivault-blog-app

## セットアップ・依存関係の解決

本リポジトリはpnpm workspaceを利用しています。新しい依存パッケージを追加した場合や、パッケージ間の参照エラーが発生した場合は、必ず以下を実行してください。

```bash
pnpm install
```

## パッケージのビルド

TypeScriptで記述されたパッケージ（例: `@estrivault/cloudinary-utils`）を利用する場合、利用前にビルドが必要です。

```bash
pnpm --filter @estrivault/cloudinary-utils run build
```

## ブログの起動

ルートディレクトリで以下のコマンドを実行し、`apps/astro-blog` の開発サーバを起動します:

```bash
npm run dev:astro-blog
```
