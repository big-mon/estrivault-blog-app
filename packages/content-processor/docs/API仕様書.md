# 📑 content-processor — API 仕様書

## 1. 目的

Markdown 文字列／ファイルを入力として **メタデータ（Front‑matter）と安全な HTML** を返すユーティリティ API を定義する。

---

## 2. 型定義（`types.ts`）

```ts
export interface PostMeta {
  /** ファイル名 slug （拡張子なし）*/
  slug: string;
  /** 記事タイトル */
  title: string;
  /** 公開日時（ISO 8601 文字列）*/
  publishedAt: string;
  /** 更新日時（ISO 8601 文字列, 任意）*/
  updatedAt?: string;
  /** カテゴリ名 */
  category: string;
  /** タグ配列 */
  tags: string[];
  /** カバー画像URL（OG画像 or サムネURL, 任意）*/
  coverImage?: string;
  /** 下書きフラグ（任意）*/
  draft?: boolean;
  /** 読了時間（分, 任意）*/
  readingTime?: number;
}

export interface PostHTML {
  meta: PostMeta;
  html: string; // sanitize 済み HTML
}
```

---

## 3. 公開 API

| 関数             | シグネチャ                                                                     | 説明                                   |
| ---------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| `loadFromString` | `(md: string, opts?: ProcessorOptions) ⇒ Promise<PostHTML>`                    | 文字列入力を直接変換                   |
| `loadFromFile`   | `(filePath: string, opts?: ProcessorOptions) ⇒ Promise<PostHTML>`              | ファイルを読み込み変換                 |
| `getAllPosts`    | `(globPattern: string\|string[], opts?: ListOptions) ⇒ Promise<PostMeta[]>`    | Front‑matter 一覧取得（HTML 生成なし） |
| `getPostBySlug`  | `(slug: string, baseDir: string, opts?: ProcessorOptions) ⇒ Promise<PostHTML>` | slug 指定で 1 件取得                   |

### 3.1 オプション型

```ts
export interface ProcessorOptions {
  /** 埋め込みプラグインを明示的に追加 */
  embeds?: {
    youtube?: boolean;
    twitter?: boolean;
    github?: boolean;
    amazon?: boolean;
  };
  /** Cloudinary 変換ベース URL */
  imageBase?: string;
  /** rehype-sanitize schema (カスタムタグ許可用) */
  sanitizeSchema?: import("hast-util-sanitize").Schema;
}

export interface ListOptions {
  page?: number; // ページ番号（1 起点）
  perPage?: number; // デフォルト 20
  sort?: "publishedAt" | "title"; // ソートキー
}
```

---

## 4. 使用例

### 4.1 SvelteKit で 1 記事取得

```ts
// +page.server.ts
import { getPostBySlug } from "@estrivault/content-processor";

export async function load({ params }) {
  const post = await getPostBySlug(params.slug, "content/posts");
  return { post };
}
```

### 4.2 CLI で HTML に変換

```ts
import { loadFromFile } from "@estrivault/content-processor";

const res = await loadFromFile("content/posts/ai-gpu.md", {
  embeds: { youtube: true, twitter: true },
});
console.log(res.html);
```

---

## 5. 例外

| エラークラス         | 発生条件                                         |
| -------------------- | ------------------------------------------------ |
| `FileNotFoundError`  | `loadFromFile` の対象が存在しない                |
| `FrontMatterError`   | 必須項目（title, publishedAt）が欠落 or フォーマット不正 |
| `MarkdownParseError` | unified パイプライン処理失敗                     |

---

## 6. 今後拡張予定

- `searchPosts(query: string)` – Pagefind 連携で全文検索結果返却
- `generateRssFeed()` – RSS XML を返す util
