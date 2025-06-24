import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import type { Paragraph, Link } from 'mdast';

/**
 * プレーンテキストのGitHubURLを自動的に埋め込みカードに変換するremarkプラグイン
 */
export const remarkGithubEmbed: Plugin = () => {
  return (tree) => {
    visit(tree, (node: Node, index?: number, parent?: Node) => {
      // linkノードでGitHubURLをチェック (remarkが自動的にURLをlinkに変換するため)
      if (node.type === 'link') {
        const linkNode = node as Link;
        const url = linkNode.url;
        const githubUrlRegex =
          /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/(?:issues|pull)\/(\d+))?(?:\/.*)?$/;
        const match = url.match(githubUrlRegex);

        // 単独のリンクの場合（パラグラフ内に1つだけのリンクノード）
        if (match && parent && parent.type === 'paragraph') {
          const paragraphNode = parent as Paragraph;
          if (paragraphNode.children.length === 1) {
            const [fullUrl, owner, repo, issueOrPrNumber] = match;

            // リポジトリ情報を解析
            let type = 'repo';
            let displayText = `${owner}/${repo}`;

            if (issueOrPrNumber) {
              if (fullUrl.includes('/issues/')) {
                type = 'issue';
                displayText += ` Issue #${issueOrPrNumber}`;
              } else if (fullUrl.includes('/pull/')) {
                type = 'pr';
                displayText += ` PR #${issueOrPrNumber}`;
              }
            }

            // OGP画像URL（GitHubが自動生成するOGP画像）
            const ogpImageUrl = `https://opengraph.githubassets.com/1/${owner}/${repo}`;

            // GitHub埋め込みカードを作成（フル幅、ホバー効果付き）
            const embedNode = {
              type: 'html',
              value: `<div style="margin: 1rem 0;">
<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; height: 150px; width: 100%; border: 1px solid #d1d9e0; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); text-decoration: none; color: inherit; overflow: hidden; transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.12)'; this.style.borderColor='#0969da';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.06)'; this.style.borderColor='#d1d9e0';">
  <div style="flex: 1; min-width: 0; padding: 20px; display: flex; flex-direction: column; justify-content: center;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <svg width="18" height="18" viewBox="0 0 16 16" fill="#24292f">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      <span style="font-weight: 600; font-size: 16px; color: #24292f;">${displayText}</span>
    </div>
    <div style="font-size: 13px; color: #656d76; background: #eef2f5; padding: 4px 10px; border-radius: 5px; display: inline-block; width: fit-content;">
      ${
        type === 'repo' ? 'Repository'
        : type === 'issue' ? 'Issue'
        : 'Pull Request'
      }
    </div>
  </div>
  <div style="flex-shrink: 0; width: 300px; height: 150px; background: #f6f8fa; display: flex; align-items: center; justify-content: center;">
    <img src="${ogpImageUrl}" alt="GitHub repository preview" style="max-width: 300px; max-height: 150px; object-fit: contain; display: block;" loading="lazy" onerror="this.parentElement.style.display='none';" />
  </div>
</a>
</div>`,
            };

            // 現在のリンクノードをHTML埋め込みに直接置き換え
            if (parent && typeof index === 'number') {
              (paragraphNode.children as Node[])[index] = embedNode;
            }
          }
        }
      }
      return undefined;
    });
  };
};
