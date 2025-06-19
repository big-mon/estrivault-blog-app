# @estrivault/content-processor

Markdownファイルを処理してHTMLに変換するコアパッケージです。unified/remark/rehype パイプラインを使用し、YouTube、Twitter、GitHub、Amazonのカスタム埋め込み機能を提供します。

## 特徴

- **統合パイプライン**: unified/remark/rehype エコシステムを使用
- **カスタム埋め込み**: YouTube、Twitter、GitHub、Amazonディレクティブのサポート
- **画像最適化**: Cloudinary連携で自動画像変換
- **フロントマター処理**: gray-matterでメタデータを抽出
- **見出し抽出**: 見出し情報とアンカーリンクの自動生成
- **読み取り時間算出**: reading-timeで推定読み取り時間を計算
- **リンク変換**: 内部・外部リンクの自動変換
- **型安全**: TypeScriptで書かれた型安全なAPI

## インストール

```bash
pnpm add @estrivault/content-processor
```

## 基本的な使い方

### Markdownの処理

```typescript
import { processMarkdown, extractMetadata } from '@estrivault/content-processor';

// Markdownコンテンツの完全処理（HTML + メタデータ）
const result = await processMarkdown(markdownContent, {
  cloudinaryCloudName: 'your-cloud-name'
});

console.log(result.meta.title); // タイトル
console.log(result.meta.readingTime); // 読み取り時間
console.log(result.html); // 変換されたHTML
console.log(result.headings); // 見出し情報

// メタデータのみ抽出
const meta = await extractMetadata(markdownContent);
console.log(meta.tags); // タグ配列
console.log(meta.category); // カテゴリ
```

### フロントマターの処理

```typescript
import { parseFrontmatter } from '@estrivault/content-processor';

// フロントマターの解析
const { data, content } = parseFrontmatter(markdownWithFrontmatter);
console.log(data.title); // フロントマターのタイトル
console.log(content); // Markdownコンテンツ
```

### パイプラインの直接使用

```typescript
import { createPipeline } from '@estrivault/content-processor';

// カスタムオプションでパイプラインを作成
const pipeline = createPipeline({
  cloudinaryCloudName: 'your-cloud-name',
  // その他のオプション
});

// Markdownを直接処理
const result = await pipeline.process(markdownContent);
console.log(String(result)); // 変換されたHTML
```

### ユーティリティ関数

```typescript
import { normalizeForSlug, normalizeForTagFilter } from '@estrivault/content-processor';

// URLスラッグの正規化
const slug = normalizeForSlug('日本語のタイトル');

// タグフィルター用の正規化
const normalizedTag = normalizeForTagFilter('タグ名');
```

## サポートしている埋め込み

### YouTube
```markdown
::youtube[dQw4w9WgXcQ]
```

### Twitter
```markdown
::twitter[https://twitter.com/user/status/123456789]
```

### GitHub
```markdown
::github[https://github.com/user/repo]
```

### Amazon
```markdown
::amazon[B08N5WRWNW]
```

## アーキテクチャ

### パイプライン構成

1. **remark-parse**: Markdownのパーシング
2. **remark-directive**: カスタムディレクティブの処理
3. **remark-gfm**: GitHub Flavored Markdownのサポート
4. **カスタムプラグイン**: 埋め込み変換・変換処理
5. **remark-rehype**: MarkdownからHTMLへの変換
6. **rehype-raw**: HTMLのローデータ処理
7. **rehype-sanitize**: HTMLのサニタイゼーション
8. **rehype-stringify**: HTMLの文字列化

### ファイル構成

```
src/
├── index.ts              # メインエクスポート
├── processor.ts          # コア処理機能
├── pipeline.ts           # 統合パイプライン
├── types.ts              # 型定義
├── errors.ts             # エラークラス
├── plugins/
│   ├── embeds/           # 埋め込みプラグイン
│   │   ├── youtube-embed.ts
│   │   ├── twitter-embed.ts
│   │   ├── github-embed.ts
│   │   └── amazon-embed.ts
│   └── transforms/       # 変換プラグイン
│       ├── image-transform.ts
│       ├── link-transform.ts
│       ├── heading-anchor.ts
│       └── heading-extractor.ts
└── utils/
    └── normalize.ts      # 文字列正規化
```

## 開発

### ビルド

```bash
pnpm build
```

### 開発時の監視

```bash
pnpm dev
```

## 主な依存関係

- **unified**: テキスト処理パイプライン
- **remark-parse**: Markdownパーサー
- **remark-directive**: カスタムディレクティブサポート
- **remark-gfm**: GitHub Flavored Markdownサポート
- **rehype-raw**: HTML処理
- **rehype-sanitize**: HTMLサニタイゼーション
- **gray-matter**: フロントマターパーサー
- **reading-time**: 読み取り時間算出
- **@estrivault/cloudinary-utils**: 画像最適化

## ライセンス

MIT