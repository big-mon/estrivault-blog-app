import { getPostBySlug } from '$lib/posts';
import { error } from '@sveltejs/kit';
import { type PostHTML } from '@estrivault/content-processor';

// ブログ記事のISR設定
// ブログ記事は比較的静的なコンテンツなので、長時間キャッシュできる
export const config = {
  isr: {
    // 1時間キャッシュ（3600秒）
    expiration: 3600,
    // 開発・プレビュー用のバイパス機能（オプション）
    ...(process.env.PRERENDER_BYPASS_TOKEN && { bypassToken: process.env.PRERENDER_BYPASS_TOKEN }),
    // ソーシャルシェアやアナリティクスなどのクエリパラメータを許可
    allowQuery: ['utm_source', 'utm_medium', 'utm_campaign', 'ref']
  }
};

export const load = async ({
  params,
}: {
  params: { slug: string };
}): Promise<{ post: PostHTML; hasTwitterEmbed: boolean }> => {
  try {
    const { slug } = params;

    const post = await getPostBySlug(slug);

    // HTMLコンテンツからTwitter埋め込みを検出
    const hasTwitterEmbed = post.html.includes('class="twitter-tweet"');

    return {
      post,
      hasTwitterEmbed,
    };
  } catch (err) {
    console.error('記事の読み込み中にエラーが発生しました:', err);
    throw error(500, '記事の読み込み中にエラーが発生しました');
  }
};
