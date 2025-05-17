# Content Processor

コンテンツプロセッサは、マークダウンファイルの処理と変換を行うためのライブラリです。

## 特徴

- マークダウンのパースとHTMLへの変換
- カスタムプラグインによる拡張可能な処理パイプライン
- ファイルシステムからの読み込み・保存機能
- 型安全なAPI

## インストール

```bash
npm install @estrivault/content-processor
# または
yarn add @estrivault/content-processor
```

## 基本的な使い方

```typescript
import { ContentProcessor } from '@estrivault/content-processor';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const processor = new ContentProcessor({
  // 設定オプション
});

// マークダウンファイルを処理
const result = await processor.processFile(
  path.join(__dirname, 'example.md'),
  {
    // 処理オプション
  }
);

console.log(result.html); // 変換されたHTML
console.log(result.meta); // メタデータ
```

## ドキュメント

詳細なドキュメントは [docs/](./docs/) ディレクトリを参照してください。

- [はじめに](./docs/getting-started.md)
- [APIリファレンス](./docs/api-reference.md)
- [アーキテクチャ概要](./docs/architecture.md)
- [プラグイン開発ガイド](./docs/plugins.md)

## ライセンス

MIT
