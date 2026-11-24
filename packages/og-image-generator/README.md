# @estrivault/og-image-generator

ブログ記事向けの OGP 画像を PNG として生成するユーティリティパッケージです。React 要素を `satori` で SVG 化し、`@resvg/resvg-js` で PNG に変換します。

`generatePostOgpPng({ title, category, publishedAt })` は `Promise<Uint8Array>` で PNG バイナリを返します。

## 開発

```bash
pnpm --filter @estrivault/og-image-generator build
pnpm --filter @estrivault/og-image-generator test
```

共通の前提と検証手順は[development guide](../../docs/development.md)を参照してください。

## Font Credit

このパッケージは `packages/og-image-generator/assets/` に以下のフォントを同梱して使用しています。

- `Noto Sans JP Regular`
- `Noto Sans JP Bold`

クレジット:
Copyright 2014, 2015 Adobe Systems Incorporated. Noto is a trademark of Google Inc.

ライセンス:
This Font Software is licensed under the SIL Open Font License, Version 1.1.

## ライセンス

MIT
