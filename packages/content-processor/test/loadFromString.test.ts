import { describe, it, expect } from 'vitest';
import { loadFromString } from '../src';

describe('loadFromString', () => {
  it('正しくMarkdown文字列を処理してHTMLとメタデータを返す', async () => {
    const markdown = `---
title: テスト記事
description: テスト用の記事です
date: 2025-04-23
category: テスト
tags:
  - サンプル
  - テスト
---

# テスト記事

これはテスト用の記事です。`;

    const result = await loadFromString(markdown);
    
    // メタデータの検証
    expect(result.meta).toMatchObject({
      title: 'テスト記事',
      description: 'テスト用の記事です',
      date: '2025-04-23',
      category: 'テスト',
      tags: ['サンプル', 'テスト'],
      readingTime: expect.any(Number)
    });
    
    // HTML出力の検証
    expect(result.html).toContain('<h1>テスト記事</h1>');
    expect(result.html).toContain('<p>これはテスト用の記事です。</p>');
  });

  it('Front-matterが不足している場合にエラーを投げる', async () => {
    // titleが欠けている
    const markdownNoTitle = `---
date: 2025-04-23
---

# テスト記事`;

    await expect(loadFromString(markdownNoTitle)).rejects.toThrow('titleが含まれていません');

    // dateが欠けている
    const markdownNoDate = `---
title: テスト記事
---

# テスト記事`;

    await expect(loadFromString(markdownNoDate)).rejects.toThrow('dateが含まれていません');
  });

  it('読了時間を正しく計算する', async () => {
    // 短い記事
    const shortMarkdown = `---
title: 短い記事
date: 2025-04-23
---

これは短い記事です。`;

    const shortResult = await loadFromString(shortMarkdown);
    expect(shortResult.meta.readingTime).toBeLessThanOrEqual(1);

    // 長い記事（約500単語）
    let longContent = `---
title: 長い記事
date: 2025-04-23
---

# 長い記事\n\n`;

    // 約500単語の文章を生成
    for (let i = 0; i < 100; i++) {
      longContent += 'これは長い記事のテストです。この文章は読了時間の計算をテストするために使用されます。 ';
    }

    const longResult = await loadFromString(longContent);
    expect(longResult.meta.readingTime).toBeGreaterThan(1);
  });
});
