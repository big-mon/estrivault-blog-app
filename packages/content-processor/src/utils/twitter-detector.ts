import { visit, EXIT } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * Markdownの構文木にTwitterの埋め込みディレクティブが含まれているかを検出する
 * @param tree Markdownの構文木
 * @returns Twitterの埋め込みが含まれている場合はtrue
 */
export function hasTwitterEmbeds(tree: Root): boolean {
  let hasTwitter = false;

  visit(tree, ['containerDirective', 'leafDirective', 'textDirective'], (node) => {
    if ('name' in node && typeof node.name === 'string' && node.name === 'twitter') {
      hasTwitter = true;
      return EXIT; // ASTのトラバーサルを中断
    }
  });

  return hasTwitter;
}
