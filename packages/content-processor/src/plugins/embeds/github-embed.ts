import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

/**
 * プレーンテキストのGitHubURLを自動的に埋め込みカードに変換するremarkプラグイン
 */
export const remarkGithubEmbed: Plugin = () => {
  return (tree) => {
    visit(tree, (node: any, index?: number, parent?: any) => {
      // linkノードでGitHubURLをチェック (remarkが自動的にURLをlinkに変換するため)
      if (node.type === 'link') {
        const url = node.url;
        const githubUrlRegex = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/(?:issues|pull)\/(\d+))?(?:\/.*)?$/;
        const match = url.match(githubUrlRegex);

        // デバッグログ
        console.log('GitHub URL check (link node):', { url, match: !!match, children: node.children });

        // デバッグ: ノード構造を確認
        console.log('Node structure debug:', {
          nodeType: node.type,
          parentType: parent?.type,
          parentParentType: parent?.parent?.type,
          parentChildrenLength: parent?.children?.length,
          index
        });

        // 単独のリンクの場合（パラグラフ内に1つだけのリンクノード）
        if (match && parent && parent.type === 'paragraph' && parent.children.length === 1) {
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

          console.log('Converting GitHub URL to embed:', { fullUrl, owner, repo, type });

          // GitHub埋め込みカードを作成
          const embedNode = {
            type: 'html',
            value: `<div class="github-embed-card" style="margin: 1.5rem 0; padding: 1rem; border: 1px solid #e1e5e9; border-radius: 8px; background: #f6f8fa;">
  <div class="github-embed-header" style="display: flex; align-items: center; margin-bottom: 0.5rem;">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 0.5rem;">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
    <span style="font-weight: 600; color: #24292f;">${displayText}</span>
  </div>
  <div class="github-embed-description" style="color: #656d76; font-size: 0.875rem; margin-bottom: 0.75rem;">
    ${type === 'repo' ? 'Repository' : type === 'issue' ? 'Issue' : 'Pull Request'}
  </div>
  <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="github-embed-link" style="display: inline-block; padding: 0.5rem 1rem; background: #2da44e; color: white; text-decoration: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500;">
    View on GitHub
  </a>
</div>`
          };

          // パラグラフノード自体を置き換える方法を試す
          if (parent && typeof index === 'number') {
            // 現在のリンクノードをHTML埋め込みに直接置き換え
            parent.children[index] = embedNode;
            console.log('Successfully replaced link node with GitHub embed');
          } else {
            console.log('Could not replace link node:', { 
              hasParent: !!parent,
              indexType: typeof index 
            });
          }
        }
      }
    });
  };
};