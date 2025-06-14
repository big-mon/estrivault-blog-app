# @estrivault/content-processor

Markdownファイルを処理してHTMLに変換するコアパッケージです。unified/remark/rehype パイプラインを使用し、YouTube、Twitter、GitHub、Amazonのカスタム埋め込み機能を提供します。

## 特徴

- **統合パイプライン**: unified/remark/rehype エコシステムを使用
- **カスタム埋め込み**: YouTube、Twitter、GitHub、Amazonのサポート
- **画像最適化**: Cloudinary連携で自動画像変換
- **フロントマター処理**: gray-matterでメタデータを抽出
- **ファイルウォーキング**: ディレクトリ全体の一括処理
- **読み取り時間算出**: reading-timeで推定読み取り時間を計算
- **型安全**: TypeScriptで書かれた型安全なAPI

## インストール

```bash
pnpm add @estrivault/content-processor
```

## 基本的な使い方

### ファイルの読み込みと処理

```typescript
import { loadFile, createPipeline } from '@estrivault/content-processor';

// ファイルの読み込み
const fileData = await loadFile('/path/to/your/post.md');
console.log(fileData.frontmatter); // フロントマターデータ
console.log(fileData.content); // Markdownコンテンツ

// パイプラインでHTMLに変換
const pipeline = createPipeline();
const result = await pipeline.process(fileData.content);
console.log(result.toString()); // 変換されたHTML
```

### ディレクトリ全体の処理

```typescript
import { walkMarkdownFiles } from '@estrivault/content-processor';

// ディレクトリ内の全Markdownファイルを取得
const posts = await walkMarkdownFiles('/path/to/content/blog');

for (const post of posts) {
  console.log(post.slug); // ファイル名から生成されたスラッグ
  console.log(post.frontmatter.title); // タイトル
  console.log(post.readingTime); // 読み取り時間
}
```

### ユーティリティ関数

```typescript
import { normalizeForSlug, normalizeForTagFilter } from '@estrivault/content-processor';

// URLスラッグの正規化
const slug = normalizeForSlug('日本語のタイトル'); // 日本語タイトルの正規化

// タグフィルター用の正規化
const normalizedTag = normalizeForTagFilter('タグ名'); // タグフィルター用の正規化
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
4. **カスタムプラグイン**: 埋め込み変換
5. **remark-rehype**: MarkdownからHTMLへの変換
6. **rehype-raw**: HTMLのローデータ処理
7. **rehype-sanitize**: HTMLのサニタイゼーション
8. **rehype-stringify**: HTMLの文字列化

### ファイル構成

```
src/
├── index.ts              # メインエクスポート
├── pipeline.ts          # 統合パイプライン
├── types.ts             # 型定義
├── loaders/
│   └── file-loader.ts    # ファイル読み込み
├── plugins/
│   └── embeds/           # 埋め込みプラグイン
│       ├── youtube-embed.ts
│       ├── twitter-embed.ts
│       ├── github-embed.ts
│       └── amazon-embed.ts
└── utils/
    ├── file-walker.ts    # ファイルウォーキング
    └── normalize.ts      # 文字列正規化
```

## 開発

### ビルド

```bash
pnpm build
```

### テスト

```bash
pnpm test
```

## 依存関係

- **unified**: テキスト処理パイプライン
- **remark**: Markdown処理エコシステム
- **rehype**: HTML処理エコシステム
- **gray-matter**: フロントマターパーサー
- **reading-time**: 読み取り時間算出
- **@estrivault/cloudinary-utils**: 画像最適化

## ライセンス

MIT
