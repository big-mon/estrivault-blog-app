import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

/**
 * Markdown ASTにコードブロックが存在するかを検出する
 * @param tree Markdown AST
 * @returns コードブロックが存在する場合はtrue
 */
export function hasCodeBlocks(tree: Root): boolean {
  let hasCode = false;

  visit(tree, 'code', () => {
    hasCode = true;
    // 検出したら早期終了
    return false;
  });

  return hasCode;
}