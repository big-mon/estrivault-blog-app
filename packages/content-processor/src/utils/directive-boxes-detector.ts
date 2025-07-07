import { visit, EXIT } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * Markdownの構文木にディレクティブボックス（info, alert, warn）が含まれているかを検出する
 * @param tree Markdownの構文木
 * @returns ディレクティブボックスが含まれている場合はtrue
 */
export function hasDirectiveBoxes(tree: Root): boolean {
  let hasDirectives = false;

  visit(tree, ['containerDirective', 'leafDirective', 'textDirective'], (node) => {
    if (
      'name' in node &&
      typeof node.name === 'string' &&
      ['info', 'alert', 'warn'].includes(node.name)
    ) {
      hasDirectives = true;
      return EXIT; // ASTのトラバーサルを中断
    }
    return undefined;
  });

  return hasDirectives;
}
