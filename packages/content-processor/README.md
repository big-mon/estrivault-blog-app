# @estrivault/content-processor

`estrivault-blog-app` の Markdown コンテンツを HTML に変換するワークスペース内パッケージです。

ブログ記事とノートの本文処理を担い、frontmatter、カスタム埋め込み、画像・リンク変換、見出し抽出、読了時間の算出をまとめて扱います。このパッケージはリポジトリ管理下の Markdown を前提にしています。実装方針や trust boundary の詳細はルートの `AGENTS.md` を参照してください。

## 主な役割

- Markdown + frontmatter を解析する
- YouTube、Twitter、GitHub、Amazon の埋め込み記法を HTML に変換する
- Cloudinary 連携で画像URLを最適化する
- 見出し情報、読了時間、記事メタデータを抽出する
- Astro アプリが描画できる HTML を生成する

## 主なAPI

- `processMarkdown(markdown, options)`:
  Markdown本文をHTML、メタデータ、見出し情報に変換します。

- `extractMetadata(markdown)`:
  frontmatter と本文から記事メタデータだけを抽出します。

- `parseFrontmatter(markdown)`:
  frontmatter と本文を分離します。

- `createPipeline(options, enableSyntaxHighlight)`:
  unified/remark/rehype の変換パイプラインを直接作成します。

- `normalizeForSlug(value)` / `normalizeForTagFilter(value)`:
  ルーティングやタグ絞り込み用に文字列を正規化します。

## 対応している埋め込み

```markdown
::youtube[dQw4w9WgXcQ]
::twitter[https://twitter.com/user/status/123456789]
::github[https://github.com/user/repo]
::amazon[B08N5WRWNW]
```

## 開発

リポジトリルートから実行します。

```bash
pnpm --filter @estrivault/content-processor build
```
