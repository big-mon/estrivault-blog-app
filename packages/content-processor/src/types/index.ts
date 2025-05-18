// コア型のエクスポート
export type { PostMeta, PostHTML } from './core/post';
export type { ProcessorOptions, ListOptions } from './core/options';

// エラークラスのエクスポート
export { FileNotFoundError, FrontMatterError, MarkdownParseError } from './errors';

// 型ユーティリティ
export type { Schema } from 'hast-util-sanitize';
