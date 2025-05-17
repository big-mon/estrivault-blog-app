import { Processor } from 'unified';
import { ProcessorOptions } from '../types';

type AnyProcessor = Processor<any, any, any, any, any>;

/**
 * パイプライン処理関数の型
 */
export type PipelineProcessor = (
  processor: AnyProcessor,
  options?: ProcessorOptions
) => AnyProcessor;

/**
 * プラグインの設定オプション
 */
export interface PluginOptions {
  /** プラグインを有効にするかどうか */
  enabled?: boolean;
  /** プラグイン固有のオプション */
  [key: string]: any;
}

/**
 * プラグインの登録情報
 */
export interface PluginRegistration {
  /** プラグイン関数 */
  plugin: PipelineProcessor;
  /** プラグインのオプション */
  options?: PluginOptions;
}
