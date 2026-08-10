import type { PostMeta } from '@estrivault/content-processor';

export function getArchiveTagStats(
  posts: PostMeta[],
  excludedTag?: string,
): { topTags: string[]; uniqueTagCount: number } {
  const tagCounts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      if (tag === excludedTag) {
        continue;
      }

      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const topTags = [...tagCounts]
    .sort(([tagA, countA], [tagB, countB]) => countB - countA || tagA.localeCompare(tagB))
    .slice(0, 5)
    .map(([tag]) => tag);

  return { topTags, uniqueTagCount: tagCounts.size };
}
