import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getAllPosts, getPostBySlug } from '../src';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('getAllPosts & getPostBySlug', () => {
  const tempDir = path.join(os.tmpdir(), 'content-processor-test-' + Date.now());

  // テスト用の複数のMarkdownファイルを作成
  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });

    // 記事1
    await fs.writeFile(path.join(tempDir, 'post1.md'), `---
title: 記事1
description: 最初の記事です
slug: post1
publishedAt: 2025-04-23
category: テスト
tags: ["サンプル", "テスト"]
---

# 記事1

これは最初の記事です。`);

    // 記事2
    await fs.writeFile(path.join(tempDir, 'post2.md'), `---
title: 記事2
description: 2番目の記事です
slug: post2
publishedAt: 2025-04-22
category: サンプル
tags: ["テスト"]
---

# 記事2

これは2番目の記事です。`);

    // 記事3
    await fs.writeFile(path.join(tempDir, 'post3.md'), `---
title: 記事3
description: 3番目の記事です
slug: post3
publishedAt: 2025-04-21
category: テスト
tags: ["サンプル"]
---

# 記事3

これは3番目の記事です。`);

    // 下書き記事
    await fs.writeFile(path.join(tempDir, 'draft.md'), `---
title: 下書き記事
description: これは下書き記事です
slug: draft
publishedAt: 2025-04-20
category: 下書き
tags: ["下書き"]
draft: true
---

# 下書き記事

これは下書き記事です。`);
  });

  // テスト後にテンポラリディレクトリを削除
  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('getAllPosts', () => {
    it('指定されたパターンに一致するMarkdownファイルからメタデータ一覧を取得する', async () => {
      const posts = await getAllPosts('**/*.md', {
        baseDir: tempDir,
        sort: 'publishedAt',
        filter: () => true // すべての記事を含める
      });

      // 全ての記事（下書きを含む）が取得できることを確認
      expect(posts.length).toBe(4);

      // 日付順（降順）にソートされていることを確認
      expect(posts[0].title).toBe('記事1');
      expect(posts[1].title).toBe('記事2');
      expect(posts[2].title).toBe('記事3');
      expect(posts[3].title).toBe('下書き記事');
    });

    it('フィルタオプションを使用して特定の記事だけを取得できる', async () => {
      // 下書きでない記事だけを取得
      const publishedPosts = await getAllPosts('**/*.md', {
        baseDir: tempDir,
        filter: (post) => !post.draft
      });

      expect(publishedPosts.length).toBe(3);
      expect(publishedPosts.every(post => !post.draft)).toBe(true);

      // 特定のカテゴリの記事だけを取得
      const testCategoryPosts = await getAllPosts('**/*.md', {
        baseDir: tempDir,
        filter: (post) => post.category === 'テスト'
      });

      expect(testCategoryPosts.length).toBe(2);
      expect(testCategoryPosts.every(post => post.category === 'テスト')).toBe(true);
    });

    it('ソートオプションを使用して記事を並べ替えできる', async () => {
      // タイトル順にソート
      const titleSortedPosts = await getAllPosts('**/*.md', {
        baseDir: tempDir,
        sort: 'title'
      });

      // デバッグ用
      console.log('titleSortedPosts:', titleSortedPosts.map(p => p.title));

      expect(titleSortedPosts[0].title).toBe('記事1');
      expect(titleSortedPosts[1].title).toBe('記事2');
      expect(titleSortedPosts[2].title).toBe('記事3');
      expect(titleSortedPosts[3].title).toBe('下書き記事');
    });

    it('ページネーションオプションを使用して記事を分割できる', async () => {
      // 1ページ目（2件）
      const page1 = await getAllPosts('**/*.md', {
        baseDir: tempDir,
        page: 1,
        perPage: 2,
        sort: 'title'
      });

      // デバッグ用
      console.log('page1:', page1.map(p => p.title));

      expect(page1.length).toBe(2);
      expect(page1[0].title).toBe('記事1');
      expect(page1[1].title).toBe('記事2');

      // 2ページ目（2件）
      const page2 = await getAllPosts('**/*.md', {
        baseDir: tempDir,
        page: 2,
        perPage: 2,
        sort: 'title'
      });

      // デバッグ用
      console.log('page2:', page2.map(p => p.title));

      expect(page2.length).toBe(2);
      expect(page2[0].title).toBe('記事3');
      expect(page2[1].title).toBe('下書き記事');
    });
  });

  describe('getPostBySlug', () => {
    it('指定されたslugに一致するMarkdownファイルを処理してHTMLとメタデータを返す', async () => {
      const post = await getPostBySlug('sample', tempDir);

      // メタデータの検証
      expect(post.meta).toMatchObject({
        title: '記事1',
        description: '最初の記事です',
        slug: 'post1',
        publishedAt: '2025-04-23',
        category: 'テスト',
        tags: ['サンプル', 'テスト'],
        readingTime: expect.any(Number)
      });

      // HTML出力の検証
      expect(post.html).toContain('<h1>記事1</h1>');
      expect(post.html).toContain('<p>これは最初の記事です。</p>');
    });

    it('存在しないslugを指定した場合にエラーを投げる', async () => {
      await expect(getPostBySlug('non-existent', tempDir)).rejects.toThrow('ファイルが見つかりません');
    });
  });
});
