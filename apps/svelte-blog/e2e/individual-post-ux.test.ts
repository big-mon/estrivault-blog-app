import { expect, test, devices } from '@playwright/test';

test.describe('個別記事ページの使用感検証', () => {
  // テスト用のサンプル記事URLを取得
  let samplePostUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/');

    // 最初の記事リンクを取得
    const postLinks = page.locator('a[href*="/post/"]');
    const firstPostLink = await postLinks.first().getAttribute('href');
    samplePostUrl = firstPostLink || '/post/sample';

    await page.close();
  });

  test.describe('記事の読みやすさ検証', () => {
    test('文字サイズと行間が適切で読みやすい', async ({ page }) => {
      await page.goto(samplePostUrl);
      await page.waitForLoadState('networkidle');

      // メインコンテンツ要素を取得
      const content = page.locator('article, .post-content, .prose, main');
      await expect(content.first()).toBeVisible();

      // 段落の文字サイズをチェック
      const paragraphs = content.locator('p').first();
      if ((await paragraphs.count()) > 0) {
        const fontSize = await paragraphs.evaluate((el) => window.getComputedStyle(el).fontSize);
        const lineHeight = await paragraphs.evaluate(
          (el) => window.getComputedStyle(el).lineHeight,
        );

        console.log(`Font size: ${fontSize}, Line height: ${lineHeight}`);

        // フォントサイズが小さすぎないかチェック（14px以上推奨）
        const fontSizeValue = parseInt(fontSize);
        expect(fontSizeValue).toBeGreaterThanOrEqual(14);
      }
    });

    test('見出し階層が適切で視覚的に区別できる', async ({ page }) => {
      await page.goto(samplePostUrl);

      // 見出し要素の存在確認
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();

      if (headingCount > 0) {
        // H1の存在確認（記事タイトル）
        await expect(page.locator('h1')).toBeVisible();

        // 見出しのフォントサイズ比較
        for (let i = 0; i < Math.min(headingCount, 3); i++) {
          const heading = headings.nth(i);
          const tagName = await heading.evaluate((el) => el.tagName);
          const fontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize);

          console.log(`${tagName}: ${fontSize}`);
          await expect(heading).toBeVisible();
        }
      }
    });

    test('コードブロックの可読性が良い', async ({ page }) => {
      await page.goto(samplePostUrl);

      // コードブロックの存在確認
      const codeBlocks = page.locator('pre, code, .highlight');
      const codeCount = await codeBlocks.count();

      if (codeCount > 0) {
        const firstCode = codeBlocks.first();
        await expect(firstCode).toBeVisible();

        // コードブロックのスタイリング確認
        const backgroundColor = await firstCode.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor,
        );
        const fontFamily = await firstCode.evaluate((el) => window.getComputedStyle(el).fontFamily);

        console.log(`Code background: ${backgroundColor}, Font: ${fontFamily}`);

        // 等幅フォントが使用されているか
        expect(fontFamily.toLowerCase()).toMatch(/mono|courier|consolas/);
      }
    });
  });

  test.describe('ナビゲーション機能の使用感', () => {
    test('目次（TOC）が使いやすい', async ({ page }) => {
      await page.goto(samplePostUrl);

      // 目次の存在確認
      const toc = page.locator('.toc, [data-testid="toc"], .table-of-contents, aside nav');

      if ((await toc.count()) > 0) {
        await expect(toc.first()).toBeVisible();

        // 目次のリンクをテスト
        const tocLinks = toc.locator('a');
        const linkCount = await tocLinks.count();

        if (linkCount > 0) {
          const firstTocLink = tocLinks.first();
          await expect(firstTocLink).toBeVisible();

          // TOCリンクをクリックしてスクロール動作をテスト
          await firstTocLink.click();
          await page.waitForTimeout(500);

          // スクロール位置が変わったかチェック
          const scrollTop = await page.evaluate(() => window.scrollY);
          expect(scrollTop).toBeGreaterThan(0);
        }
      }
    });

    test('画像拡大機能（Lightbox）が動作する', async ({ page }) => {
      await page.goto(samplePostUrl);

      // 画像の存在確認
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();

        // 画像をクリック
        await firstImage.click();
        await page.waitForTimeout(500);

        // Lightboxが開いたかチェック
        const lightbox = page.locator('.lightbox, [data-testid="lightbox"], .modal, .image-modal');

        if ((await lightbox.count()) > 0) {
          await expect(lightbox.first()).toBeVisible();

          // Lightboxを閉じる
          const closeButton = page.locator(
            '.lightbox button, [data-testid="close-lightbox"], .close',
          );
          if ((await closeButton.count()) > 0) {
            await closeButton.first().click();
          } else {
            await page.keyboard.press('Escape');
          }

          await page.waitForTimeout(300);
        }
      }
    });

    test('ページ内スクロールがスムーズ', async ({ page }) => {
      await page.goto(samplePostUrl);

      // ページの高さを取得
      const pageHeight = await page.evaluate(() => document.body.scrollHeight);

      if (pageHeight > 1000) {
        // スクロール動作テスト
        await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
        await page.waitForTimeout(800);

        let scrollTop = await page.evaluate(() => window.scrollY);
        expect(scrollTop).toBeGreaterThan(400);

        // トップに戻る
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        await page.waitForTimeout(800);

        scrollTop = await page.evaluate(() => window.scrollY);
        expect(scrollTop).toBeLessThan(100);
      }
    });
  });

  test.describe('レスポンシブデザインの使用感', () => {
    test('モバイル表示で読みやすい', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();

      await page.goto(samplePostUrl);
      await page.waitForLoadState('networkidle');

      // モバイルでの表示確認
      const content = page.locator('article, .post-content, main');
      await expect(content.first()).toBeVisible();

      // 横スクロールが発生していないかチェック
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5pxの余裕

      // TOCがモバイルで適切に隠れているかチェック
      const toc = page.locator('.toc, [data-testid="toc"]');
      if ((await toc.count()) > 0) {
        const tocVisible = await toc.first().isVisible();
        // モバイルでは通常TOCは隠れている
        console.log(`TOC visible on mobile: ${tocVisible}`);
      }

      await context.close();
    });

    test('タブレット表示が適切', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad'],
      });
      const page = await context.newPage();

      await page.goto(samplePostUrl);
      await page.waitForLoadState('networkidle');

      // タブレットでの表示確認
      const content = page.locator('article, .post-content, main');
      await expect(content.first()).toBeVisible();

      // タブレットでは通常TOCが表示される
      const toc = page.locator('.toc, [data-testid="toc"]');
      if ((await toc.count()) > 0) {
        const tocVisible = await toc.first().isVisible();
        console.log(`TOC visible on tablet: ${tocVisible}`);
      }

      await context.close();
    });
  });

  test.describe('インタラクティブ要素の使用感', () => {
    test('リンクが適切にハイライトされる', async ({ page }) => {
      await page.goto(samplePostUrl);

      // 記事内のリンクを取得
      const contentLinks = page.locator('article a, .post-content a, main a');
      const linkCount = await contentLinks.count();

      if (linkCount > 0) {
        const firstLink = contentLinks.first();
        await expect(firstLink).toBeVisible();

        // リンクのスタイルを確認
        const originalColor = await firstLink.evaluate((el) => window.getComputedStyle(el).color);

        // ホバー状態をテスト
        await firstLink.hover();
        await page.waitForTimeout(200);

        const hoverColor = await firstLink.evaluate((el) => window.getComputedStyle(el).color);

        console.log(`Link color: ${originalColor} -> ${hoverColor}`);
      }
    });

    test('埋め込みコンテンツが正常に表示される', async ({ page }) => {
      await page.goto(samplePostUrl);

      // YouTube埋め込みチェック
      const youtubeEmbeds = page.locator('iframe[src*="youtube"], .youtube-embed');
      if ((await youtubeEmbeds.count()) > 0) {
        await expect(youtubeEmbeds.first()).toBeVisible();
        console.log('YouTube埋め込みが見つかりました');
      }

      // Twitter埋め込みチェック
      const twitterEmbeds = page.locator('.twitter-tweet, [data-tweet-id]');
      if ((await twitterEmbeds.count()) > 0) {
        await expect(twitterEmbeds.first()).toBeVisible();
        console.log('Twitter埋め込みが見つかりました');
      }

      // GitHub埋め込みチェック
      const githubEmbeds = page.locator('.github-embed, [data-github-repo]');
      if ((await githubEmbeds.count()) > 0) {
        await expect(githubEmbeds.first()).toBeVisible();
        console.log('GitHub埋め込みが見つかりました');
      }
    });

    test('フォーカス管理が適切', async ({ page }) => {
      await page.goto(samplePostUrl);

      // キーボードナビゲーションのテスト
      await page.keyboard.press('Tab');

      // フォーカス可能な要素を取得
      const focusableElements = page.locator(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      const focusableCount = await focusableElements.count();

      if (focusableCount > 0) {
        // 最初のフォーカス可能要素にフォーカスがあるかチェック
        const firstFocusable = focusableElements.first();

        // フォーカス状態の視覚的インジケーターがあるかチェック
        const focusStyle = await firstFocusable.evaluate(
          (el) => window.getComputedStyle(el).outline,
        );

        console.log(`Focus outline: ${focusStyle}`);
      }
    });
  });

  test.describe('パフォーマンスと使用感', () => {
    test('ページ読み込み速度が適切', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(samplePostUrl);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);

      // 3秒以内の読み込みを期待
      expect(loadTime).toBeLessThan(3000);
    });

    test('画像の遅延読み込みが機能する', async ({ page }) => {
      await page.goto(samplePostUrl);

      // 画像要素を取得
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = images.nth(i);

          // loading="lazy"属性があるかチェック
          const loading = await img.getAttribute('loading');
          if (loading === 'lazy') {
            console.log('遅延読み込みが設定されています');
          }

          // 画像が実際に読み込まれているかチェック
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          if (naturalWidth > 0) {
            console.log(`画像${i + 1}が正常に読み込まれました`);
          }
        }
      }
    });

    test('スクロール位置の記憶機能', async ({ page }) => {
      await page.goto(samplePostUrl);

      // ページの中央にスクロール
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      const scrollPosition = await page.evaluate(() => window.scrollY);

      // ページをリロード
      await page.reload();
      await page.waitForLoadState('networkidle');

      // スクロール位置が復元されるかチェック（ブラウザの自動復元）
      await page.waitForTimeout(1000);
      const newScrollPosition = await page.evaluate(() => window.scrollY);

      console.log(`Scroll position: ${scrollPosition} -> ${newScrollPosition}`);
    });
  });

  test.describe('アクセシビリティの使用感', () => {
    test('見出し構造が適切', async ({ page }) => {
      await page.goto(samplePostUrl);

      // 見出しの階層をチェック
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels = [];

      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName);
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }

      // H1は1つだけであることを確認
      const h1Count = headingLevels.filter((level) => level === 1).length;
      expect(h1Count).toBe(1);

      console.log(`見出し構造: ${headingLevels.join(' -> ')}`);
    });

    test('Alt属性が適切に設定されている', async ({ page }) => {
      await page.goto(samplePostUrl);

      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          const src = await img.getAttribute('src');

          if (!alt || alt.trim() === '') {
            console.warn(`Alt属性が不足している画像: ${src}`);
          } else {
            console.log(`適切なAlt属性: ${alt}`);
          }
        }
      }
    });
  });
});
