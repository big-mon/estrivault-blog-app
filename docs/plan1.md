# Astro ブログ開発 — 初期フェーズ計画書

**対象リポジトリ**: `estrivault-blog-app/apps/astro-blog`
**目的**: Markdown 記事を高速配信する静的ブログを Astro のみで構築し、テンプレート公開の下地を作る。

---

## 0. 役割定義

| 役割            | 担当                                         | 補足                               |
| --------------- | -------------------------------------------- | ---------------------------------- |
| AI エージェント | コード生成・設定ファイル作成・自動テスト実行 | ChatOps/Bot 等                     |
| レビュー担当    | 人間（あなた）                               | PR レビュー・設計承認・CI 結果確認 |

---

## 1. マイルストーン概要

| #   | タイトル                    | 完了基準                                |
| --- | --------------------------- | --------------------------------------- |
| M1  | プロジェクト初期化          | `pnpm i && pnpm dev` がエラー無しで起動 |
| M2  | Markdown コレクション       | ダミー記事がトップページに一覧表示      |
| M3  | レイアウト & スタイル       | Tailwind ベースのレスポンシブ UI 完成   |
| M4  | 各種静的ページ              | 404 / About / Tags ページ動作           |
| M5  | Lint & Format 自動化        | `pnpm lint`・`pnpm format` が CI に組込 |
| M6  | GitHub Actions/CDN デプロイ | main ブランチ push→Preview URL が生成   |

---

## 2. 詳細タスク（チェックリスト）

### M1 ─ プロジェクト初期化

- [ ] `apps/astro-blog` へ `npm create astro@latest`（framework: blog, template: minimal）
- [ ] `astro.config.mjs` の `site`, `output` を `"https://{preview_domain}"`, `"static"` に設定
- [ ] `.gitignore` に `apps/astro-blog/src/content/**` を追加
- [ ] `pnpm --filter astro-blog dev` で起動確認

---

### M2 ─ Markdown コレクション

- [ ] `src/content/blog/_placeholder.md` を追加（front-matter: `publish:false`）
- [ ] `astro.config.mjs` に以下を記述：

  ```ts
  import { defineCollection, z } from "astro:content";
  export const collections = {
    blog: defineCollection({
      schema: z.object({
        title: z.string(),
        publish: z.boolean().default(true),
        date: z.date(),
      }),
    }),
  };
  ```

- [ ] `src/pages/index.astro` にて `getCollection('blog')` → 公開記事を一覧表示

---

### M3 ─ レイアウト & スタイル

- [ ] `astro add tailwind` を実行（Tailwind 4 preset 対応）
- [ ] 共通レイアウトファイルを作成：

  `src/layouts/BaseLayout.astro`

  ```astro
  ---
  const { title = "My Blog" } = Astro.props;
  ---

  <!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
    </head>
    <body class="bg-white text-gray-900">
      <slot />
    </body>
  </html>
  ```

- [ ] コンポーネントを追加：

  - `src/components/Header.astro`
  - `src/components/Footer.astro`
  - `src/components/PostCard.astro`

- [ ] トップページにて `PostCard` を利用し、記事一覧を整形
- [ ] Lighthouse モバイル・デスクトップでスコア 90 以上を目指す

---

### M4 ─ 静的ページ

- [ ] 404 ページ

  ```astro:src/pages/404.astro
  ---
  import BaseLayout from "../layouts/BaseLayout.astro";
  ---

  <BaseLayout title="404 Not Found">
    <h1 class="text-4xl font-bold">ページが見つかりません</h1>
    <p>URL をご確認ください。</p>
  </BaseLayout>
  ```

- [ ] About ページ
      `src/pages/about.astro` を作成し、運営者プロフィールなどを記載

- [ ] タグ別ページ
      `src/pages/tags/[tag].astro` を作成し、`params.tag` をキーに `getCollection('blog')` から絞り込み表示

---

### M5 ─ 品質ゲート

- [ ] `packages/config` に以下を設置：

  - `.eslintrc.cjs`
  - `.prettierrc`
  - `tsconfig.base.json`

- [ ] `pnpm lint` コマンドを定義：

  ```json
  {
    "scripts": {
      "lint": "eslint . --ext .astro,.ts,.js"
    }
  }
  ```

- [ ] `pnpm format` コマンドを定義：

  ```json
  {
    "scripts": {
      "format": "prettier --write ."
    }
  }
  ```

- [ ] `husky + lint-staged` を導入し、コミット前チェックを実装

---

### M6 ─ CI/CD & プレビュー

- [ ] `GitHub Actions` で CI 実行：

  ```yaml:.github/workflows/ci.yml
  name: Build and Preview

  on:
    push:
      branches: [main]
    pull_request:

  jobs:
    build:
      runs-on: ubuntu-latest

      steps:
        - uses: actions/checkout@v4

        - uses: pnpm/action-setup@v3
          with:
            version: '8'

        - name: Install dependencies
          run: pnpm i

        - name: Build Astro blog
          run: pnpm --prefix apps/astro-blog run build

        - name: Upload artifact
          uses: actions/upload-pages-artifact@v3
          with:
            path: apps/astro-blog/dist
  ```

- [ ] Cloudflare Pages または GitHub Pages に接続
- [ ] PR ごとに Preview URL を発行・検証可能にする

---

## 3. インフラ／運用メモ

| 項目            | 採用ツール                            | 初期設定の要点                                    |
| --------------- | ------------------------------------- | ------------------------------------------------- |
| パッケージ管理  | pnpm workspaces                       | ルートに workspaces:[ "apps/*", "packages/*" ]    |
| タスク実行      | turbo (optional)                      | 今フェーズでは未必須、CI 導入時に turbo.json 追加 |
| ホスティング    | Cloudflare Pages または GitHub Pages  | SSG 出力 (HTML/Asset) をそのまま配信              |
| ロギング / 監視 | Cloudflare Analytics または Plausible | <script> を BaseLayout に埋め込み                 |

---

## 4. 完了判定・次フェーズへの橋渡し

- main ブランチの CI がグリーンで、Preview/CDN URL でブログが閲覧可能
- Markdown 記事を 1 ファイル追加 → 自動的にトップページに反映されること
- Lighthouse モバイル/デスクトップ平均スコア ≥ 90
- README に ローカル開発手順・記事追加方法 を記載
- タグ一覧ページ の実装が終わったら “動的 UI 拡張 (検索・コメント)” を要件定義し、SvelteKit 併存フェーズを準備する
