import { visit, EXIT } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * Markdownの構文木にAmazonの埋め込みディレクティブが含まれているかを検出する
 * @param tree Markdownの構文木
 * @returns Amazonの埋め込みが含まれている場合はtrue
 */
export function hasAmazonEmbeds(tree: Root): boolean {
  let hasAmazon = false;

  visit(tree, ['containerDirective', 'leafDirective', 'textDirective'], (node) => {
    if ('name' in node && typeof node.name === 'string' && node.name === 'amazon') {
      hasAmazon = true;
      return EXIT; // ASTのトラバーサルを中断
    }
  });

  return hasAmazon;
}
