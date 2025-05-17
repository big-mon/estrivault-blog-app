import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkdownParser } from '../../src/core/markdown/parser';
import { FrontMatterError } from '../../src/types/errors';

// モジュールをモック
vi.mock('unified', () => {
  const mockProcess = vi.fn().mockResolvedValue({ value: '<p>Test content</p>' });
  return {
    unified: vi.fn().mockReturnValue({
      process: mockProcess
    })
  };
});

vi.mock('gray-matter', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation((content: string) => ({
    data: { title: 'Test Title' },
    content: 'Test content',
  }))
}));

vi.mock('reading-time', () => ({
  __esModule: true,
  default: () => ({
    minutes: 2.5,
    words: 500,
    time: 150000,
  })
}));

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
    vi.clearAllMocks();
  });

  describe('parse', () => {
    it('通常のマークダウンを正しくパースできること', async () => {
      // テストデータ
      const content = `---
title: Test Title
---
Test content`;

      // テスト実行
      const result = await parser.parse(content);

      // 検証
      expect(result).toEqual({
        meta: {
          slug: '',
          title: 'Test Title',
          description: '',
          publishedAt: expect.any(String),
          updatedAt: expect.any(String),
          category: '',
          tags: [],
          coverImage: '',
          draft: false,
          readingTime: 3
        },
        html: '<p>Test content</p>'
      });
    });

    it('Front-matterにtitleが含まれていない場合はエラーをスローすること', async () => {
      // gray-matterのモックを上書きしてtitleなしのデータを返す
      const matter = await import('gray-matter');
      vi.mocked(matter.default).mockImplementationOnce(() => ({
        data: {},
        content: 'Test content',
        excerpt: '',
        isEmpty: false,
        orig: Buffer.from(''),
        language: '',
        matter: '',
        stringify: () => ''
      }));

      await expect(parser.parse('Test content')).rejects.toThrow(
        FrontMatterError
      );
    });

    it('publishedAtが指定されていない場合は現在日時が設定されること', async () => {
      const now = new Date().toISOString();
      const matter = await import('gray-matter');
      
      // テスト用のモックデータを設定
      vi.mocked(matter.default).mockImplementationOnce(() => ({
        data: { title: 'Test' },
        content: 'Content',
        excerpt: '',
        isEmpty: false,
        orig: Buffer.from(''),
        language: '',
        matter: '',
        stringify: () => ''
      }));
      
      const result = await parser.parse('---\ntitle: Test\n---\nContent');
      
      expect(new Date(result.meta.publishedAt).getTime())
        .toBeGreaterThanOrEqual(new Date(now).getTime() - 1000); // 1秒以内の許容誤差
    });

    it('CloudinaryのURLが正しく解決されること', async () => {
      const matter = await import('gray-matter');
      
      // テスト用のモックデータを設定
      vi.mocked(matter.default).mockImplementationOnce(() => ({
        data: { 
          title: 'Test',
          coverImage: '/images/test.jpg' 
        },
        content: 'Content',
        excerpt: '',
        isEmpty: false,
        orig: Buffer.from(''),
        language: '',
        matter: '',
        stringify: () => ''
      }));
      
      const options = { cloudinaryCloudName: 'test-cloud' };
      const result = await parser.parse('dummy', options);
      
      expect(result.meta.coverImage).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/w_800/images/test'
      );
    });

    it('外部URLの場合はそのまま返されること', async () => {
      const matter = await import('gray-matter');
      
      // テスト用のモックデータを設定
      vi.mocked(matter.default).mockImplementationOnce(() => ({
        data: { 
          title: 'Test',
          coverImage: 'https://example.com/image.jpg' 
        },
        content: 'Content',
        excerpt: '',
        isEmpty: false,
        orig: Buffer.from(''),
        language: '',
        matter: '',
        stringify: () => ''
      }));
      
      const result = await parser.parse('dummy');
      expect(result.meta.coverImage).toBe('https://example.com/image.jpg');
    });
  });
});
