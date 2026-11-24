# @estrivault/cloudinary-utils

Cloudinary画像URLを生成する、リポジトリ内部のワークスペースパッケージです。

## API

- `buildUrl(cloudName, publicId, options)` — 本文・カバー画像用の URL を返します。実体は named 変換
  `t_body`（`c_limit,w_1200,f_auto,q_auto`）のみで、`options` の幅・品質は互換のため残していますが URL
  には反映されません。
- `buildSrcSet(cloudName, publicId, options)` — `t_body` の単一 URL をそのまま返します（幅別の
  `srcset` は生成しません）。

## 開発

リポジトリルートから実行します。

```bash
pnpm --filter @estrivault/cloudinary-utils build
pnpm --filter @estrivault/cloudinary-utils dev
```

共通の前提と検証手順は[development guide](../../docs/development.md)を参照してください。
