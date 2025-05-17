import { unified, type Processor } from 'unified';
import type { ProcessorOptions } from '../../types';
import type { PipelineProcessor } from '../types';
import {
  createCoreProcessor,
  createSanitizeProcessor,
} from '../processors/core';
import {
  createLinkTransformProcessor,
  createImageTransformProcessor,
  createEmbedProcessors,
} from '../processors/plugins';

/**
 * デフォルトのパイプラインプロセッサー配列
 */
const DEFAULT_PROCESSORS: PipelineProcessor[] = [
  createCoreProcessor,
  createLinkTransformProcessor,
  createImageTransformProcessor,
  createEmbedProcessors,
  createSanitizeProcessor,
];

/**
 * パイプラインを構築する
 * @param options 処理オプション
 * @param customProcessors カスタムプロセッサー
 * @returns 構築されたパイプライン
 */
export function createPipeline(
  options: ProcessorOptions = {},
  customProcessors: PipelineProcessor[] = []
) {
  // デフォルトのプロセッサーとカスタムプロセッサーを結合
  const processors = [...DEFAULT_PROCESSORS, ...customProcessors];

  // パイプラインを構築
  return processors.reduce(
    (processor, processorFn) => processorFn(processor, options),
    unified()
  ) as Processor;
}
