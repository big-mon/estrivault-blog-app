import { describe, it, expect } from 'vitest';
import { createProcessor } from '../src/pipeline';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

describe('pipeline', () => {
  it('基本的なMarkdown変換パイプラインが正しく動作する', async () => {
    const processor = createProcessor();
    const markdown = `# テスト見出し

これは**太字**と*斜体*を含むテキストです。

- リスト項目1
- リスト項目2
`;

    const result = await processor.process(markdown);
    const html = String(result);

    expect(html).toContain('<h1>テスト見出し</h1>');
    expect(html).toContain('<strong>太字</strong>');
    expect(html).toContain('<em>斜体</em>');
    expect(html).toContain('<li>リスト項目1</li>');
    expect(html).toContain('<li>リスト項目2</li>');
  });

  it('外部リンクに target="_blank" rel="noopener noreferrer" が自動付与される', async () => {
    const processor = createProcessor();
    const markdown = `[内部リンク](/internal) と [外部リンク](https://example.com)`;

    const result = await processor.process(markdown);
    const html = String(result);

    // 内部リンクには属性が付与されない
    expect(html).toContain('<a href="/internal">内部リンク</a>');
    
    // 外部リンクには属性が付与される
    expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">外部リンク</a>');
  });

  it('埋め込みオプションを有効にした場合に正しく処理される', async () => {
    const processor = createProcessor({
      embeds: {
        youtube: true
      }
    });
    
    const markdown = `::youtube{id="dQw4w9WgXcQ"}`;

    const result = await processor.process(markdown);
    const html = String(result);
    
    // 正規表現を使って動的なスタイルを許容
    const expectedPattern = /<div class="youtube-embed"[^>]*>\s*<iframe[^>]*src="https:\/\/www\.youtube\.com\/embed\/dQw4w9WgXcQ"[^>]*>[\s\S]*<\/div>/;
    expect(html).toMatch(expectedPattern);
  });

  it('画像変換オプションを指定した場合に正しく処理される', async () => {
    const processor = createProcessor({
      imageBase: 'https://res.cloudinary.com/demo/image/upload'
    });
    
    const markdown = `![テスト画像](/images/test.jpg)`;

    const result = await processor.process(markdown);
    const html = String(result);

    expect(html).toContain('https://res.cloudinary.com/demo/image/upload/images/test');
  });
});
