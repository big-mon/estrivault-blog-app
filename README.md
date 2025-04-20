# estrivault-blog-app

## セットアップ・依存関係の解決

本リポジトリは pnpm workspace を利用しています。新しい依存パッケージを追加した場合や、パッケージ間の参照エラーが発生した場合は、必ず以下を実行してください。

```bash
pnpm install
```

## パッケージのビルド

TypeScript で記述されたパッケージ（例: `@estrivault/cloudinary-utils`）を利用する場合、利用前にビルドが必要です。

```bash
pnpm --filter @estrivault/cloudinary-utils run build
```

## ブログの起動

ルートディレクトリで以下のコマンドを実行し、`apps/astro-blog` の開発サーバを起動します:

```bash
pnpm run dev:astro-blog
```
