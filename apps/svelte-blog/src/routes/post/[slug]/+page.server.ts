import { getPostBySlug } from '$lib/posts';
import { error } from '@sveltejs/kit';
import { type PostHTML } from '@estrivault/content-processor';
import { GITHUB_API_BASE, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } from '$constants';
import { GITHUB_TOKEN } from '$env/static/private';
import type { Contributor, GitHubCommit } from '$lib/types/github';

// プリレンダリング設定（個別記事は静的生成）
export const prerender = true;

// プリレンダリング対象のエントリー
export async function entries() {
  try {
    const { getAllPostsMetaStatic } = await import('$lib/file-utils');
    const { PUBLIC_CLOUDINARY_CLOUD_NAME } = await import('$env/static/public');

    const processorOptions = {
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
    };

    const allPosts = await getAllPostsMetaStatic(processorOptions);

    return allPosts.map((post) => ({ slug: post.slug }));
  } catch (err) {
    console.error('Failed to generate entries for post prerendering:', err);
    // プリレンダリング時のエラーはビルドを失敗させるべきなので再スロー
    throw new Error(
      `Post entries generation failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function fetchContributors(filePath: string): Promise<Contributor[]> {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub token not configured, skipping contributors fetch');
    return [];
  }

  try {
    const commitsUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits`;
    const commitsParams = new URLSearchParams({
      path: filePath,
      per_page: '100',
    });

    const response = await fetch(`${commitsUrl}?${commitsParams}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'estrivault-blog-app',
      },
    });

    if (!response.ok) {
      console.warn(`GitHub API error for ${filePath}: ${response.status} ${response.statusText}`);
      return [];
    }

    const commits: GitHubCommit[] = await response.json();
    const contributorsMap = new Map<string, Contributor>();

    // 最初のコミット者（著者）を特定
    const firstCommit = commits[commits.length - 1];
    const authorLogin = firstCommit?.author?.login;

    for (const commit of commits) {
      if (commit.author && commit.author.login) {
        const login = commit.author.login;
        const existing = contributorsMap.get(login);

        if (existing) {
          existing.contributions++;
          if (new Date(commit.commit.author.date) > new Date(existing.last_commit_date)) {
            existing.last_commit_date = commit.commit.author.date;
          }
        } else {
          contributorsMap.set(login, {
            login: commit.author.login,
            id: commit.author.id,
            avatar_url: commit.author.avatar_url,
            html_url: commit.author.html_url,
            contributions: 1,
            last_commit_date: commit.commit.author.date,
          });
        }
      }
    }

    return Array.from(contributorsMap.values()).sort((a, b) => {
      // 著者を最初に表示
      if (a.login === authorLogin && b.login !== authorLogin) return -1;
      if (b.login === authorLogin && a.login !== authorLogin) return 1;

      // その他は編集回数と最終編集日でソート
      if (a.contributions !== b.contributions) {
        return b.contributions - a.contributions;
      }
      return new Date(b.last_commit_date).getTime() - new Date(a.last_commit_date).getTime();
    });
  } catch (err) {
    console.error(`Error fetching contributors for ${filePath}:`, err);
    return [];
  }
}

export const load = async ({
  params,
}: {
  params: { slug: string };
}): Promise<{ post: PostHTML; contributors: Contributor[] }> => {
  try {
    const { slug } = params;

    const post = await getPostBySlug(slug);

    // GitHub貢献者情報を取得（ビルド時/ISR時のみ）
    const contributors = post.originalPath ? await fetchContributors(post.originalPath) : [];

    return {
      post,
      contributors,
    };
  } catch (err) {
    console.error('記事の読み込み中にエラーが発生しました:', err);
    throw error(500, '記事の読み込み中にエラーが発生しました');
  }
};
