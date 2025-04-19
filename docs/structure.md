```txt
estrivault-blog-app/                # ★GitHub で公開するテンプレート・リポジトリ
├─ apps/                      # “将来複数アプリ” を見据えた親ディレクトリ
│  ├─ astro-blog/             # ① 現在稼働する Astro プロジェクト
│  │  ├─ public/              # 静的アセット
│  │  ├─ src/
│  │  │  ├─ components/       # UI コンポーネント (Astro・Svelte・React など混在可)
│  │  │  ├─ layouts/          # ページ共通レイアウト
│  │  │  ├─ pages/            # ルーティング不要な静的ページ (404 など)
│  │  │  └─ content/          # ★Markdown 記事（非公開のため .gitignore）
│  │  ├─ astro.config.mjs
│  │  ├─ package.json         # Astro 依存だけを記載
│  │  └─ tsconfig.json
│  └─ svelte-blog/            # ② 将来的な SvelteKit 置換用 ― 今は空 or stub
│      ├─ src/                # 移行フェーズで生成
│      └─ …
├─ packages/                  # 共通ライブラリ (任意)
│  ├─ ui/                     # Svelte/React/Vanilla で再利用する UI キット
│  └─ config/                 # tsconfig / eslint / prettier 共有設定
├─ .gitignore                 # 記事・秘密鍵などを除外
├─ package.json               # ルート：workspaces 定義 & 共通スクリプト
├─ turbo.json                 # Turborepo タスク定義（CI 高速化用、後述）
└─ README.md                  # テンプレート利用方法
```
