import { visit, EXIT } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * Markdownの構文木に「info」「alert」「warn」いずれかのディレクティブボックスが含まれているかを判定する。
 *
 * @param tree - 判定対象のMarkdown構文木
 * @returns 指定されたディレクティブボックスが1つ以上含まれていればtrue、含まれていなければfalse
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
