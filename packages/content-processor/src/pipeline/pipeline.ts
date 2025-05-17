import { ProcessorOptions } from '../types';
import { createPipeline } from './factories/pipeline-factory';

/**
 * Markdownをパースし、HTMLに変換するパイプラインを構築する
 * @deprecated 新しい `createPipeline` 関数を使用してください
 * @param options 処理オプション
 * @returns unified処理パイプライン
 */
export function createProcessor(options: ProcessorOptions = {}) {
  return createPipeline(options);
}

export { createPipeline } from './factories/pipeline-factory';
