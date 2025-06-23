import type { Root } from 'mdast';
import { visit, EXIT } from 'unist-util-visit';

/**
 * Markdown ASTにコードブロックが存在するかを検出する
 * @param tree Markdown AST
 * @returns コードブロックが存在する場合はtrue
 */
export function hasCodeBlocks(tree: Root): boolean {
  let hasCode = false;

  visit(tree, 'code', () => {
    hasCode = true;
    return EXIT; // 全体の探索を中断
  });

  return hasCode;
}