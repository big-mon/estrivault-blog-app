// コアAPI - Markdownコンテンツ処理
export { processMarkdown, parseFrontmatter, extractMetadata } from './processor';

// 型
export * from './types';

// パイプライン
export { createPipeline } from './pipeline';

// ユーティリティ
export { normalizeForTagFilter, normalizeForSlug } from './utils/normalize';

// 非推奨：ファイル読み込み機能は個別アプリケーションで実装してください
// @deprecated ファイル読み込み機能はsvelte-blog側に移行されました
export { loadFile } from './loaders/file-loader';
// @deprecated ファイル読み込み機能はsvelte-blog側に移行されました  
export { walkMarkdownFiles, walkMarkdownFilesWithPath } from './utils/file-walker';
