---
title: SvelteKitで作るGitHubコントリビューター表示コンポーネント
description: SvelteKitブログサイトにGitHubコントリビューター表示機能を実装する方法を実用的に解説。GitHub API連携、認証、エラーハンドリング、パフォーマンス最適化まで、実際に動作するコードで段階的に紹介。
slug: svelte-github-contributors-component-implementation
publishedAt: 2025-06-24T12:00:00
coverImage: /Hero/nupi2m3ci5tyo9eyrm0a
category: Tech
tags: ['プログラミング', 'SvelteKit', 'GitHub API', '実装']
---

「自分のブログサイトにも、記事の著者や編集者を表示する機能を追加したい」

GitHubでブログ記事を管理している場合、コミット履歴から自動でコントリビューター情報を取得・表示できれば、手動でクレジット管理する必要がなくなります。

この記事では、**実際に動作するコード**を使って、SvelteKitブログサイトにGitHubコントリビューター表示機能を実装する方法を解説します。最小限の実装から始めて、段階的に改善していく実用的なアプローチを取ります。

## 実現する機能と仕組み

### 完成イメージ
- 記事の下部にコントリビューターのアバター画像を表示
- ホバーで詳細情報（ユーザー名、最終編集日）を表示
- クリックでGitHubプロフィールにリンク

![実装イメージ](/Tech/k2qdfwgoa9rn9tsv32jx)

### データの流れ
```
[GitHub API] → [SvelteKit Server] → [Component] → [Browser]
     ↓              ↓                 ↓            ↓
コミット履歴    コントリビューター    アバター     ユーザー
   取得          情報加工           画像表示      操作
```

### 必要なファイル
```
src/
├── routes/post/[slug]/
│   ├── +page.server.ts     # GitHub API呼び出し
│   └── +page.svelte        # ページ表示
├── components/Post/
│   └── GitHubContributors.svelte  # コンポーネント
├── lib/types/
│   └── github.ts           # 型定義
└── constants/
    └── index.ts            # 設定値
```

## Step 1: 最小限の実装で動作確認

### 1.1 GitHub Personal Access Token の取得

**GitHub設定ページ**で新しいトークンを作成：
1. https://github.com/settings/personal-access-tokens にアクセス
2. "Generate new token" をクリック
3. Permissions > Repository permissions > Contentsで"Read-only"を選択
4. トークンをコピー（再表示されないので注意）

### 1.2 環境変数の設定

```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here
```

### 1.3 基本的な型定義

```typescript
// src/lib/types/github.ts
export interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  last_commit_date: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  } | null;
}
```

### 1.4 GitHub API呼び出し（サーバーサイド）

```typescript
// src/routes/post/[slug]/+page.server.ts
import { GITHUB_TOKEN } from '$env/dynamic/private';
import type { Contributor, GitHubCommit } from '$lib/types/github';

export async function load({ params }) {
  const contributors = await fetchContributors(`content/blog/${params.slug}.md`);

  return {
    contributors
  };
}

async function fetchContributors(filePath: string): Promise<Contributor[]> {
  // トークンがない場合はスキップ
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set');
    return [];
  }

  try {
    // GitHub Commits API を呼び出し
    const url = `https://api.github.com/repos/your-username/your-repo/commits?path=${filePath}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const commits: GitHubCommit[] = await response.json();
    return processContributors(commits);

  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

function processContributors(commits: GitHubCommit[]): Contributor[] {
  const contributorMap = new Map<string, Contributor>();

  commits.forEach(commit => {
    if (!commit.author) return;

    const login = commit.author.login;
    if (contributorMap.has(login)) {
      contributorMap.get(login)!.contributions++;
    } else {
      contributorMap.set(login, {
        login: commit.author.login,
        id: commit.author.id,
        avatar_url: commit.author.avatar_url,
        html_url: commit.author.html_url,
        contributions: 1,
        last_commit_date: commit.commit.author.date,
      });
    }
  });

  return Array.from(contributorMap.values());
}
```

### 1.5 シンプルなコンポーネント

```svelte
<!-- src/components/Post/GitHubContributors.svelte -->
<script lang="ts">
  import type { Contributor } from '$lib/types/github';

  export let contributors: Contributor[];
</script>

{#if contributors.length > 0}
  <div class="contributors">
    <h3>Authors & Editors</h3>
    <div class="contributors-list">
      {#each contributors as contributor}
        <a href={contributor.html_url} target="_blank" rel="noopener noreferrer">
          <img
            src={contributor.avatar_url}
            alt={contributor.login}
            title={`${contributor.login} (${contributor.contributions} contributions)`}
          />
        </a>
      {/each}
    </div>
  </div>
{/if}

<style>
  .contributors {
    margin-top: 2rem;
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .contributors h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .contributors-list {
    display: flex;
    gap: 0.5rem;
  }

  .contributors-list img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #e2e8f0;
  }

  .contributors-list a:hover img {
    border-color: #3b82f6;
  }
</style>
```

### 1.6 ページに統合

```svelte
<!-- src/routes/post/[slug]/+page.svelte -->
<script lang="ts">
  import GitHubContributors from '$components/Post/GitHubContributors.svelte';

  export let data;
</script>

<article>
  <!-- 記事内容 -->
  <div class="content">
    <!-- 記事本文 -->
  </div>

  <!-- コントリビューター表示 -->
  <GitHubContributors contributors={data.contributors} />
</article>
```

### 1.7 動作確認

```bash
# 開発サーバー起動
npm run dev

# ブラウザで記事ページにアクセス
# http://localhost:5173/post/your-article-slug
```

記事の下部にコントリビューターのアバター画像が表示されれば成功です！

## さらなる改善のアイデア

基本実装が完了したら、以下の改善を検討してみてください：

### エラーハンドリングとパフォーマンス
- **詳細なエラーハンドリング**: 404、403エラーの個別対応
- **キャッシュ実装**: メモリキャッシュやISRでAPI呼び出し削減
- **レート制限対応**: 指数バックオフでの再試行機能

### UI/UX改善
- **視覚的な改善**: ホバーアニメーション、グラデーション背景
- **詳細情報表示**: 最終編集日、貢献回数の表示
- **レスポンシブ対応**: モバイル端末での表示最適化

### 機能拡張
- **ソート機能**: 貢献数、最終更新日での並び替え
- **フィルタリング**: 期間や著者での絞り込み
- **統計表示**: 貢献者数、総コミット数の表示

## まとめ

この実装により、GitHubのコミット履歴から自動でコントリビューター情報を取得・表示する機能が完成しました。

このコードをベースに、あなたのブログサイトに合わせてカスタマイズしてみてください！

実際にこのブログで実装しているコードは下記なので、参考にしてみていただけたら嬉しいです。

https://github.com/big-mon/estrivault-blog-app/blob/main/apps/svelte-blog/src/components/Post/GitHubContributors.svelte

::amazon{asin="481561539X" name="はじめてでもできる GitとGitHubの教科書"}
