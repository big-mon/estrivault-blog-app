import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { ReadTimeResults } from 'reading-time';
import { unified } from 'unified';
import type { Processor } from 'unified';
import { PostHTML, PostMeta } from '../../types/core/post';
import { ProcessorOptions } from '../../types/core/options';
import { FrontMatterError, MarkdownParseError } from '../../types/errors';

/**
 * Markdownのパースと変換を行うクラス
 */
export class MarkdownParser {
  /**
   * MarkdownをパースしてHTMLとメタデータに変換する
   * @param content 処理対象のMarkdown文字列
   * @param options 処理オプション
   * @returns 処理済みのHTMLとメタデータ
   */
  async parse(content: string, options: ProcessorOptions = {}): Promise<PostHTML> {
    try {
      // Front-matterの抽出
      const { data, content: markdownContent } = matter(content);

      // 必須フィールドの検証
      this.validateFrontMatter(data);

      // 読了時間の計算
      const stats = readingTime(markdownContent);

      // Markdownの処理
      const processor = this.createProcessor(options);
      const result = await processor.process(markdownContent);

      // メタデータの構築
      const meta = this.buildPostMeta(data, stats, options);

      return {
        meta,
        html: String(result.value),
      };
    } catch (error) {
      if (error instanceof FrontMatterError) {
        throw error;
      }
      throw new MarkdownParseError(
        error instanceof Error ? error.message : 'Unknown error occurred during markdown parsing'
      );
    }
  }

  /**
   * Front-matterの検証
   * @param data Front-matterのデータ
   * @throws {FrontMatterError} 必須フィールドが不足している場合
   */
  private validateFrontMatter(data: Record<string, any>): void {
    if (!data.title) {
      throw new FrontMatterError('Front-matterにtitleが含まれていません');
    }

    if (!data.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }
  }

  /**
   * 投稿のメタデータを構築する
   * @param data Front-matterのデータ
   * @param stats 読了時間の統計情報
   * @param options 処理オプション
   * @returns 構築されたメタデータ
   */
  private buildPostMeta(
    data: Record<string, any>,
    stats: ReadTimeResults,
    options: ProcessorOptions
  ): PostMeta {
    return {
      slug: data.slug || '',
      title: data.title,
      description: data.description || '',
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt || data.publishedAt,
      category: data.category || '',
      tags: data.tags || [],
      coverImage: this.resolveCoverImage(data.coverImage, options.cloudinaryCloudName),
      draft: data.draft || false,
      readingTime: Math.ceil(stats.minutes),
    };
  }

  /**
   * 画像のURLを解決する
   * @param coverImage 画像のURLまたはパス
   * @param cloudinaryCloudName Cloudinaryのクラウド名
   * @returns 解決された画像URL
   */
  private resolveCoverImage(coverImage?: string, cloudinaryCloudName?: string): string {
    if (!coverImage) return '';
    if (coverImage.startsWith('http') || coverImage.startsWith('data:')) return coverImage;

    // CloudinaryのURLに変換
    if (cloudinaryCloudName) {
      const publicId = coverImage.replace(/^\//, '').replace(/\.[^/.]+$/, '');
      return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/w_800/${publicId}`;
    }

    return coverImage;
  }

  /**
   * マークダウン処理パイプラインを作成する
   * @param options 処理オプション
   * @returns 設定済みのunifiedプロセッサー
   */
  private createProcessor(options: ProcessorOptions = {}): Processor {
    // ここにパイプラインの構築ロジックを実装
    // 現在はダミーの実装
    return unified();
  }
}
