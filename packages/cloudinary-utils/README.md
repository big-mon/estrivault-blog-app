# @estrivault/cloudinary-utils

Cloudinary画像URLを生成する、リポジトリ内部のワークスペースパッケージです。

## API

- `buildUrl(cloudName, publicId, options)` — `cloudName`・`publicId`・`options.w` が無いと throw します。
  返す URL は常に named 変換 `t_body` 付きの 1 本だけです。`h` / `mode` / `quality` は呼び出し互換用で URL
  には入りません。
- `buildSrcSet(cloudName, publicId, options)` — `t_body` の単一 URL をそのまま返します（幅別の
  `srcset` は生成しません）。

## 開発

リポジトリルートから実行します。

```bash
pnpm --filter @estrivault/cloudinary-utils build
pnpm --filter @estrivault/cloudinary-utils dev
```

共通の前提と検証手順は[development guide](../../docs/development.md)を参照してください。
