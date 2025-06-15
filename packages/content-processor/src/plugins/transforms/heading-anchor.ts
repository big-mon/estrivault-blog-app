import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Root, Element } from 'hast';

/**
 * 見出しタグ(h1-h6)にアンカーリンクを付与するrehypeプラグイン
 * 見出しテキストからslugを生成し、id属性とクリック可能なアンカーリンクを追加する
 */
export const rehypeHeadingAnchor: Plugin<[], Root, Root> = () => {
  const transformer: Transformer<Root, Root> = (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      // h1-h6タグのみ処理
      if (!node.tagName.match(/^h[1-6]$/)) return;

      // 見出しテキストを取得
      const textContent = getTextContent(node);
      if (!textContent) return;

      // slugを生成（日本語対応）
      const slug = generateSlug(textContent);
      
      // id属性を設定
      node.properties = {
        ...node.properties,
        id: slug,
      };

      // 見出しレベルに応じた#の数を決定
      const level = parseInt(node.tagName[1]);
      const hashSymbols = '#'.repeat(level);

      // アンカーリンク要素を作成
      const anchorLink: Element = {
        type: 'element',
        tagName: 'a',
        properties: {
          href: `#${slug}`,
          className: ['heading-anchor'],
          'aria-label': `${textContent}への直接リンク`,
        },
        children: [
          {
            type: 'text',
            value: hashSymbols,
          },
        ],
      };

      // 見出しの先頭にアンカーリンクを追加
      node.children = [anchorLink, ...node.children];
    });

    return tree;
  };

  return transformer;
};

/**
 * 要素からテキストコンテンツを再帰的に取得
 */
function getTextContent(node: Element): string {
  let text = '';
  
  for (const child of node.children) {
    if (child.type === 'text') {
      text += child.value;
    } else if (child.type === 'element') {
      text += getTextContent(child);
    }
  }
  
  return text.trim();
}

/**
 * テキストからslugを生成（日本語対応）
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 日本語文字、英数字、ハイフン、アンダースコア以外を削除
    .replace(/[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}a-z0-9\-_\s]/gu, '')
    // 空白をハイフンに変換
    .replace(/\s+/g, '-')
    // 連続するハイフンを1つに
    .replace(/-+/g, '-')
    // 先頭末尾のハイフンを削除
    .replace(/^-+|-+$/g, '');
}