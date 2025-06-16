import { getPostBySlug } from '$lib/posts';
import { error } from '@sveltejs/kit';
import { type PostHTML } from '@estrivault/content-processor';

// ISR configuration for blog posts
// Blog posts are relatively static content, so we can cache them for longer periods
export const config = {
  isr: {
    // Cache for 1 hour (3600 seconds)
    expiration: 3600,
    // Allow bypass for development/preview purposes (optional)
    ...(process.env.PRERENDER_BYPASS_TOKEN && { bypassToken: process.env.PRERENDER_BYPASS_TOKEN }),
    // Allow these query parameters for social sharing, analytics, etc.
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
