# @estrivault/cloudinary-utils

Cloudinary画像URLを生成する、リポジトリ内部のワークスペースパッケージです。

## API

- `buildUrl(cloudName, publicId, options)` — 幅、高さ、fit/fill、品質を指定して画像URLを生成します。
- `buildSrcSet(cloudName, publicId, options)` — 同じ指定からレスポンシブ画像用の`srcset`を生成します。

## 開発

リポジトリルートから実行します。

```bash
pnpm --filter @estrivault/cloudinary-utils build
pnpm --filter @estrivault/cloudinary-utils dev
```

共通の前提と検証手順は[development guide](../../docs/development.md)を参照してください。
