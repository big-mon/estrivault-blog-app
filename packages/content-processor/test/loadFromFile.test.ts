import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadFromFile } from '../src';
import fs from 'fs/promises';
import path from 'path';

describe('loadFromFile', () => {
  const fixturePath = path.join(process.cwd(), 'test/fixtures/sample.md');
  
  it('正しくMarkdownファイルを読み込み、処理してHTMLとメタデータを返す', async () => {
    const result = await loadFromFile(fixturePath);
    
    // メタデータの検証
    expect(result.meta).toMatchObject({
      title: 'サンプル記事',
      description: 'これはテスト用のサンプル記事です',
      date: '2025-04-23',
      category: 'テスト',
      tags: ['サンプル', 'テスト'],
      coverImage: '/images/sample.jpg',
      readingTime: expect.any(Number)
    });
    
    // slugの検証（ファイル名から取得）
    expect(result.meta.slug).toBe('sample');
    
    // HTML出力の検証
    expect(result.html).toContain('<h1>サンプル記事</h1>');
    expect(result.html).toContain('<p>これはテスト用のサンプル記事です。</p>');
  });

  it('存在しないファイルを指定した場合にエラーを投げる', async () => {
    const nonExistentPath = path.join(process.cwd(), 'test/fixtures/non-existent.md');
    
    await expect(loadFromFile(nonExistentPath)).rejects.toThrow('ファイルが見つかりません');
  });

  it('埋め込みオプションを指定した場合に正しく処理する', async () => {
    const result = await loadFromFile(fixturePath, {
      embeds: {
        youtube: true,
        twitter: true,
        github: true,
        amazon: true
      }
    });
    
    // YouTube埋め込みの検証
    const youtubePattern = /<div class="youtube-embed"[^>]*>\s*<iframe[^>]*src="https:\/\/www\.youtube\.com\/embed\/dQw4w9WgXcQ"[^>]*>[\s\S]*<\/div>/;
    expect(result.html).toMatch(youtubePattern);
    
    // Twitter埋め込みの検証
    const twitterPattern = /<div class="twitter-embed"[^>]*>\s*<blockquote[^>]*>\s*<a[^>]*>https:\/\/twitter\.com\/user\/status\/1234567890<\/a>\s*<\/blockquote>\s*<\/div>/;
    expect(result.html).toMatch(twitterPattern);
    
    // GitHub埋め込みの検証
    const githubPattern = /<div class="github-embed"[^>]*>\s*<a[^>]*href="https:\/\/github\.com\/big-mon\/estrivault-blog-app"[^>]*>big-mon\/estrivault-blog-app<\/a>\s*<\/div>/;
    expect(result.html).toMatch(githubPattern);
    
    // Amazon埋め込みの検証
    const amazonPattern = /<div class="amazon-embed"[^>]*>\s*<a[^>]*href="https:\/\/www\.amazon\.co\.jp\/dp\/B01234567"[^>]*>商品名<\/a>\s*<\/div>/;
    expect(result.html).toMatch(amazonPattern);
  });

  it('画像変換オプションを指定した場合に正しく処理する', async () => {
    const result = await loadFromFile(fixturePath, {
      imageBase: 'https://res.cloudinary.com/demo/image/upload'
    });
    
    // 画像URLの変換を検証
    expect(result.html).toContain('https://res.cloudinary.com/demo/image/upload/images/sample');
  });
});
