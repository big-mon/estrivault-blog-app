import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * Markdownの構文木にAmazonの埋め込みディレクティブが含まれているかを検出する
 * @param tree Markdownの構文木
 * @returns Amazonの埋め込みが含まれている場合はtrue
 */
export function hasAmazonEmbeds(tree: Root): boolean {
  let hasAmazon = false;
  
  visit(tree, (node) => {
    const isTargetType = node.type === 'containerDirective' || 
                        node.type === 'leafDirective' || 
                        node.type === 'textDirective';
    
    if (isTargetType && 'name' in node && node.name === 'amazon') {
      hasAmazon = true;
      return false; // 検出したら即座に終了
    }
  });
  
  return hasAmazon;
}