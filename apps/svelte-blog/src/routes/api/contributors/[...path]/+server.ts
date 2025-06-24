import { json, error } from '@sveltejs/kit';
import { GITHUB_API_BASE, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } from '$constants';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import type { GitHubCommit, Contributor } from '$lib/types/github';

const CONTRIBUTORS_CACHE = new Map<string, { data: Contributor[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const GET: RequestHandler = async ({ params }: { params: Record<string, string> }) => {
  const filePath = params.path;

  if (!filePath) {
    throw error(400, 'File path is required');
  }

  const GITHUB_TOKEN = env.GITHUB_TOKEN;

  if (!GITHUB_TOKEN) {
    throw error(500, 'GitHub token not configured');
  }

  // Check cache first
  const cacheKey = filePath;
  const cached = CONTRIBUTORS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return json(cached.data);
  }

  try {
    // Fetch commits for the specific file
    const commitsUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits`;
    const commitsParams = new URLSearchParams({
      path: filePath,
      per_page: '100', // Get up to 100 commits
    });

    const response = await fetch(`${commitsUrl}?${commitsParams}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'estrivault-blog-app',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw error(404, 'File not found in repository');
      }
      if (response.status === 403) {
        throw error(403, 'GitHub API rate limit exceeded or access denied');
      }
      throw error(response.status, `GitHub API error: ${response.statusText}`);
    }

    const commits: GitHubCommit[] = await response.json();

    // Process commits to extract unique contributors
    const contributorsMap = new Map<string, Contributor>();

    for (const commit of commits) {
      if (commit.author && commit.author.login) {
        const login = commit.author.login;
        const existing = contributorsMap.get(login);

        if (existing) {
          existing.contributions++;
          // Update to most recent commit date
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

    // Convert to array and sort by contributions (descending), then by most recent commit
    const contributors = Array.from(contributorsMap.values()).sort((a, b) => {
      if (a.contributions !== b.contributions) {
        return b.contributions - a.contributions;
      }
      return new Date(b.last_commit_date).getTime() - new Date(a.last_commit_date).getTime();
    });

    // Cache the result
    CONTRIBUTORS_CACHE.set(cacheKey, {
      data: contributors,
      timestamp: Date.now(),
    });

    return json(contributors);
  } catch (err) {
    console.error('Error fetching contributors:', err);

    if (err instanceof Error && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }

    throw error(500, 'Failed to fetch contributors from GitHub');
  }
};
