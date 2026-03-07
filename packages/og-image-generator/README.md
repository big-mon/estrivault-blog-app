# @estrivault/og-image-generator

ブログ記事向けの OGP 画像を PNG として生成するユーティリティパッケージです。React 要素を `satori` で SVG 化し、`@resvg/resvg-js` で PNG に変換します。

## 特徴

- 1200x630 の OGP 画像を生成
- 日本語タイトルを考慮した自動レイアウト
- `Noto Sans JP` を利用した日本語表示
- `Uint8Array` で PNG バイナリを返すシンプルな API

## インストール

```bash
pnpm add @estrivault/og-image-generator
```

## 使い方

### OGP 画像を生成する

```typescript
import { writeFile } from 'node:fs/promises';
import { generatePostOgpPng } from '@estrivault/og-image-generator';

const png = await generatePostOgpPng({
  title: 'SvelteKitで作るGitHubコントリビューター表示コンポーネント',
  category: 'Tech',
  publishedAt: new Date('2025-06-24T12:00:00.000Z'),
  slug: 'svelte-github-contributors-component-implementation',
  siteTitle: 'Estrilda',
  siteUrl: 'https://estrilda.damonge.com/',
});

await writeFile('post-ogp.png', png);
```

### タイトルレイアウトだけを確認する

```typescript
import { layoutPostOgpTitle } from '@estrivault/og-image-generator';

const layout = layoutPostOgpTitle(
  'これは非常に長い記事タイトルであり、三行に収まりきらないケースを確認するためのサンプルです。',
);

console.log(layout.lines);
console.log(layout.fontSize);
console.log(layout.truncated);
```

## API

### `generatePostOgpPng(input)`

記事情報を元に OGP 用の PNG を生成します。戻り値は `Promise<Uint8Array>` です。

```typescript
interface PostOgpCardData {
  title: string;
  category: string;
  publishedAt: Date | string;
  slug: string;
  siteTitle: string;
  siteUrl: string;
}
```

### `layoutPostOgpTitle(title)`

タイトル文字数に応じて、フォントサイズ、行高、改行位置を決定します。長すぎる場合は 3 行以内に収め、末尾に省略記号を付けます。

## 開発

### ビルド

```bash
pnpm --filter @estrivault/og-image-generator build
```

### テスト

```bash
pnpm --filter @estrivault/og-image-generator test
```

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
