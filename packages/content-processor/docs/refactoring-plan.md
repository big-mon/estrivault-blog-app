# Content Processor リファクタリング計画

## 1. ディレクトリ構造の再編

### 1.1 コアディレクトリの作成
- 作成パス: `src/core/markdown/`
- 作成パス: `src/core/filesystem/`
- 移動パス: `src/pipeline/` (既存のpipeline.tsを移動)

### 1.2 型定義の整理
- 集約先: `src/types/index.ts`
- エクスポート対象:
  - `ProcessorOptions`
  - `PostMeta`
  - `PostHTML`
  - カスタムエラークラス

## 2. コアモジュールの実装

### 2.1 Markdown パーサー
ファイル: `core/markdown/parser.ts`
```typescript
interface MarkdownParser {
  parse(content: string, options?: ParserOptions): Promise<ParsedContent>;
  transform(content: string, options?: TransformOptions): Promise<TransformedContent>;
}
```

### 2.2 ファイルシステムモジュール
ファイル: `core/filesystem/loader.ts`
```typescript
interface FileLoader {
  loadFile(path: string): Promise<string>;
  saveFile(path: string, content: string): Promise<void>;
}
```

ファイル: `core/filesystem/scanner.ts`
```typescript
interface FileScanner {
  findFiles(globPattern: string | string[], options?: ScanOptions): Promise<string[]>;
}
```

### 2.3 トランスフォーマーモジュール
ディレクトリ: `core/markdown/transformer/`
- `image.ts` - 画像URLの変換ロジック
- `meta.ts` - メタデータの抽出・変換
- `content.ts` - コンテンツの変換処理

## 3. パイプラインのリファクタリング

### 3.1 パイプラインビルダー
ファイル: `pipeline/builder.ts`
```typescript
class PipelineBuilder {
  private plugins: Plugin[] = [];
  
  use(plugin: Plugin): this {
    this.plugins.push(plugin);
    return this;
  }

  build(options: PipelineOptions): Unified.Processor {
    // パイプライン構築ロジック
  }
}
```

### 3.2 プラグインの整理
ディレクトリ: `pipeline/plugins/`
- `image-transform.ts`
- `link-transform.ts`
- `embeds/` (youtube, twitter, github など)

## 4. 移行戦略

### 4.1 互換レイヤー
ファイル: `src/compat.ts`
```typescript
// 旧APIを新しい実装でラップ
export const loadFromString = async (md: string, opts: ProcessorOptions = {}) => {
  const parser = new MarkdownParser(/* ... */);
  return parser.parse(md, opts);
};
```

## 5. テスト戦略

### 5.1 単体テスト
- 各モジュールの独立したテスト
- モックを使用した依存関係の分離

### 5.2 統合テスト
- エンドツーエンドのフロー検証
- パフォーマンスベンチマーク

## 6. ドキュメンテーション

### 6.1 APIリファレンス
```typescript
/**
 * Markdownを処理してHTMLとメタデータを返す
 * @param content - 処理対象のMarkdown文字列
 * @param options - 処理オプション
 * @returns 処理済みのHTMLとメタデータ
 */
```

### 6.2 移行ガイド
```markdown
## 旧APIから新しいAPIへの移行

### 変更前
```typescript
import { loadFromString } from '@estrivault/content-processor';
```

### 変更後
```typescript
import { MarkdownProcessor } from '@estrivault/content-processor/core';
const processor = new MarkdownProcessor();
```
```

## 実装の優先順位

1. コアモジュールの実装
   - Markdownパーサー
   - ファイルシステムモジュール
   - トランスフォーマーモジュール

2. パイプラインのリファクタリング
   - パイプラインビルダー
   - プラグインシステム

3. 互換レイヤーの実装
   - 既存APIの互換性維持
   - 段階的移行のサポート

4. テストとドキュメンテーション
   - 単体テストの実装
   - APIドキュメントの更新
   - 移行ガイドの作成
