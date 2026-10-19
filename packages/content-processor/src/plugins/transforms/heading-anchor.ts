import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Root, Element } from 'hast';
import type { HeadingInfo } from '../../types';

/**
 * 見出しタグ(h1-h6)にアンカーリンクを付与するrehypeプラグイン
 * 見出しテキストからslugを生成し、id属性とクリック可能なアンカーリンクを追加する
 */
export const rehypeHeadingAnchor: Plugin<[], Root, Root> = () => {
  const transformer: Transformer<Root, Root> = (tree: Root, file) => {
    const headings: HeadingInfo[] = [];
    const usedIds = new Set<string>();
    visit(tree, 'element', (node: Element) => {
      // h1-h6タグのみ処理
      if (!node.tagName.match(/^h[1-6]$/)) {
        return undefined;
      }

      // 見出しテキストを取得
      const textContent = getTextContent(node);
      if (!textContent) {
        return undefined;
      }

      // slugを生成（日本語対応）。同じテキストは -1, -2 と連番にして一意にする。
      const slug = uniqueId(generateSlug(textContent), usedIds);

      if (slug && /^h[1-3]$/.test(node.tagName)) {
        headings.push({ id: slug, level: Number(node.tagName[1]), text: textContent });
      }

      // id属性を設定
      node.properties = {
        ...node.properties,
        id: slug,
      };

      // アンカーリンク要素を作成
      const anchorLink: Element = {
        type: 'element',
        tagName: 'a',
        properties: {
          href: `#${slug}`,
          className: ['heading-anchor'],
          'aria-label': `${textContent}への直接リンク`,
        },
        children: [],
      };

      // 見出しの先頭にアンカーリンクを追加
      node.children = [anchorLink, ...node.children];
      return undefined;
    });

    file.data.headings = headings;
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

function uniqueId(base: string, usedIds: Set<string>): string {
  if (!usedIds.has(base)) {
    usedIds.add(base);
    return base;
  }

  let suffix = 1;
  let candidate = `${base}-${suffix}`;
  while (usedIds.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  usedIds.add(candidate);
  return candidate;
}

/**
 * テキストからslugを生成（日本語対応）
 */
function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // 日本語文字、英数字、ハイフン、アンダースコア以外を削除
      .replace(/[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}a-z0-9\-_\s]/gu, '')
      // 空白をハイフンに変換
      .replace(/\s+/g, '-')
      // 連続するハイフンを1つに
      .replace(/-+/g, '-')
      // 先頭末尾のハイフンを削除
      .replace(/^-+|-+$/g, '')
  );
}
