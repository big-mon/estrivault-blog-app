# はじめに

Content Processor の基本的な使い方を説明します。

## インストール

```bash
npm install @estrivault/content-processor
# または
yarn add @estrivault/content-processor
```

## 基本的な使い方

### インスタンスの作成

```typescript
import { ContentProcessor } from '@estrivault/content-processor';

const processor = new ContentProcessor({
  // オプション設定
  markdown: {
    // マークダウン解析オプション
  },
  plugins: [
    // 使用するプラグイン
  ]
});
```

### ファイルの処理

```typescript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ファイルを処理
const result = await processor.processFile(
  path.join(__dirname, 'example.md'),
  {
    // 処理オプション
  }
);

console.log('HTML:', result.html);
console.log('メタデータ:', result.meta);
```

### 文字列の直接処理

```typescript
const markdownContent = `
---
title: サンプル記事
date: 2023-01-01
---

# 見出し1

これはサンプルのマークダウンです。
`;

const result = await processor.processContent(markdownContent);
```

## 設定オプション

### ContentProcessor オプション

| オプション | 型 | デフォルト値 | 説明 |
|----------|----|------------|------|
| `markdown` | `MarkdownOptions` | `{}` | マークダウン解析オプション |
| `plugins` | `Plugin[]` | `[]` | 使用するプラグインの配列 |
| `cache` | `boolean` | `true` | キャッシュを有効にするか |

### 処理オプション

`processFile` と `processContent` メソッドで使用可能なオプション:

| オプション | 型 | デフォルト値 | 説明 |
|----------|----|------------|------|
| `skipCache` | `boolean` | `false` | キャッシュをスキップするか |
| `meta` | `Record<string, any>` | `{}` | 追加のメタデータ |

## 次のステップ

- [APIリファレンス](./api-reference.md) - 利用可能なメソッドとオプションの詳細
- [プラグイン開発ガイド](./plugins.md) - カスタムプラグインの作成方法
