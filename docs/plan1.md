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
