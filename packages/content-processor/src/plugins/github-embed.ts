import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

/**
 * ::github{owner="..." repo="..." type="..." id="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkGithubEmbed: Plugin = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: any) => {
      if (node.name !== 'github') return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const { owner, repo, type, id } = attributes;

      if (!owner || !repo || !type) {
        console.warn('GitHub embed directive missing required attributes (owner, repo, type)');
        return;
      }

      // HTMLノードに変換
      data.hName = 'div';
      data.hProperties = {
        className: ['github-embed'],
        style: 'margin: 1.5rem 0;'
      };

      let embedUrl = '';
      let height = '400px';

      // 埋め込みタイプに応じてURLを構築
      switch (type) {
        case 'issue':
          if (!id) {
            console.warn('GitHub issue embed directive missing id attribute');
            return;
          }
          embedUrl = `https://github.com/${owner}/${repo}/issues/${id}`;
          break;
        case 'pr':
          if (!id) {
            console.warn('GitHub PR embed directive missing id attribute');
            return;
          }
          embedUrl = `https://github.com/${owner}/${repo}/pull/${id}`;
          break;
        case 'repo':
          embedUrl = `https://github.com/${owner}/${repo}`;
          break;
        default:
          console.warn(`Unknown GitHub embed type: ${type}`);
          return;
      }

      // iframeを子要素として追加
      node.children = [{
        type: 'paragraph',
        data: {
          hName: 'div',
          hProperties: {
            className: ['github-card']
          }
        },
        children: [{
          type: 'paragraph',
          data: {
            hName: 'a',
            hProperties: {
              href: embedUrl,
              target: '_blank',
              rel: 'noopener noreferrer'
            }
          },
          children: [{
            type: 'text',
            value: `GitHub: ${owner}/${repo}${id ? ` #${id}` : ''}`
          }]
        }]
      }];
    });
  };
};
