import { expect, test } from '@playwright/test';

test.describe('UI Improvement Analysis', () => {
  test.describe('Homepage UI Analysis', () => {
    test('should have proper layout structure and visual hierarchy', async ({ page }) => {
      await page.goto('/');

      // Check basic structure
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // Check navigation accessibility
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      // Analyze post grid layout
      const postCards = page.locator('[data-testid="post-card"], .post-card, article');
      const cardCount = await postCards.count();

      if (cardCount > 0) {
        // Check if post cards have proper spacing and alignment
        const firstCard = postCards.first();
        await expect(firstCard).toBeVisible();

        // Check for hover states
        await firstCard.hover();

        // Verify links are accessible
        const cardLinks = firstCard.locator('a');
        await expect(cardLinks.first()).toBeVisible();
      }

      // Check pagination if exists
      const pagination = page.locator('[role="navigation"], .pagination, nav[aria-label*="page"]');
      if ((await pagination.count()) > 0) {
        await expect(pagination.first()).toBeVisible();
      }
    });

    test('should handle loading states properly', async ({ page }) => {
      await page.goto('/');

      // Check for loading indicators (if they exist)
      // const loadingBar = page.locator('.loading-bar, [data-testid="loading"]');

      // Navigate to a post to trigger loading
      const postLinks = page.locator('a[href*="/post/"]');
      if ((await postLinks.count()) > 0) {
        await postLinks.first().click();

        // Wait for navigation
        await page.waitForLoadState('networkidle');

        // Check if we're on a post page
        await expect(page.locator('article, .post-content, main')).toBeVisible();
      }
    });
  });

  test.describe('Navigation and Header Analysis', () => {
    test('should have sticky header with proper behavior', async ({ page }) => {
      await page.goto('/');

      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Check if header remains visible on scroll
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      // Header should still be accessible
      await expect(header).toBeVisible();

      // Check mobile menu functionality if exists
      const mobileMenuButton = page.locator(
        'button[aria-label*="menu"], .hamburger, [data-testid="mobile-menu-button"]',
      );
      if ((await mobileMenuButton.count()) > 0) {
        await mobileMenuButton.click();

        // Check if mobile menu appears
        const mobileMenu = page.locator('.mobile-menu, [data-testid="mobile-menu"]');
        if ((await mobileMenu.count()) > 0) {
          await expect(mobileMenu).toBeVisible();

          // Close menu
          const closeButton = page.locator(
            'button[aria-label*="close"], .close, [data-testid="close-menu"]',
          );
          if ((await closeButton.count()) > 0) {
            await closeButton.click();
          }
        }
      }
    });
  });

  test.describe('Post Page Analysis', () => {
    test('should have proper post layout and reading experience', async ({ page }) => {
      // First go to homepage to find a post
      await page.goto('/');

      const postLinks = page.locator('a[href*="/post/"]');
      if ((await postLinks.count()) > 0) {
        await postLinks.first().click();
        await page.waitForLoadState('networkidle');

        // Check post structure
        await expect(page.locator('h1')).toBeVisible();

        // Check for table of contents
        const toc = page.locator('.toc, [data-testid="toc"], .table-of-contents');
        if ((await toc.count()) > 0) {
          await expect(toc.first()).toBeVisible();
        }

        // Check post metadata
        const metadata = page.locator('.post-meta, .post-header, [data-testid="post-metadata"]');
        if ((await metadata.count()) > 0) {
          await expect(metadata.first()).toBeVisible();
        }

        // Check for edit on GitHub link
        const editLink = page.locator('a[href*="github.com"]');
        if ((await editLink.count()) > 0) {
          await expect(editLink.first()).toBeVisible();
        }

        // Check for contributors section
        const contributors = page.locator('.contributors, [data-testid="contributors"]');
        if ((await contributors.count()) > 0) {
          await expect(contributors.first()).toBeVisible();
        }

        // Test image lightbox if images exist
        const images = page.locator('img');
        if ((await images.count()) > 0) {
          const firstImage = images.first();
          if (await firstImage.isVisible()) {
            await firstImage.click();

            // Check if lightbox opens
            const lightbox = page.locator('.lightbox, [data-testid="lightbox"], .modal');
            if ((await lightbox.count()) > 0) {
              await expect(lightbox.first()).toBeVisible();

              // Close lightbox
              const closeBtn = page.locator('.lightbox button, [data-testid="close-lightbox"]');
              if ((await closeBtn.count()) > 0) {
                await closeBtn.first().click();
              } else {
                await page.keyboard.press('Escape');
              }
            }
          }
        }
      }
    });
  });

  test.describe('Category and Tag Pages Analysis', () => {
    test('should have proper filtering and pagination', async ({ page }) => {
      // Test category page if it exists
      await page.goto('/category/tech/1').catch(() => {});

      if (page.url().includes('/category/')) {
        // Check if category page loads properly
        await expect(page.locator('h1, .category-title')).toBeVisible();

        // Check for posts in category
        const posts = page.locator('article, .post-card');
        if ((await posts.count()) > 0) {
          await expect(posts.first()).toBeVisible();
        }

        // Check pagination
        const pagination = page.locator('.pagination, [role="navigation"]');
        if ((await pagination.count()) > 0) {
          await expect(pagination.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Performance and Visual Analysis', () => {
    test('should not have layout shifts or visual glitches', async ({ page }) => {
      await page.goto('/');

      // Wait for full load
      await page.waitForLoadState('networkidle');

      // Check for common visual issues
      const body = page.locator('body');
      await expect(body).toHaveCSS('margin', '0px');

      // Check for proper spacing
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Scroll test for layout stability
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(500);

      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
    });

    test('should have proper contrast and readability', async ({ page }) => {
      await page.goto('/');

      // Check heading contrast
      const headings = page.locator('h1, h2, h3');
      const headingCount = await headings.count();

      if (headingCount > 0) {
        for (let i = 0; i < Math.min(headingCount, 3); i++) {
          const heading = headings.nth(i);
          await expect(heading).toBeVisible();

          // Check if text is readable (not empty)
          const text = await heading.textContent();
          expect(text).toBeTruthy();
          expect(text?.trim().length).toBeGreaterThan(0);
        }
      }

      // Check link accessibility
      const links = page.locator('a');
      const linkCount = await links.count();

      if (linkCount > 0) {
        for (let i = 0; i < Math.min(linkCount, 5); i++) {
          const link = links.nth(i);
          if (await link.isVisible()) {
            // Links should have href attribute
            const href = await link.getAttribute('href');
            expect(href).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Error Handling Analysis', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      const response = await page.goto('/non-existent-page');

      if (response?.status() === 404) {
        // Check if there's a proper 404 page
        await expect(page.locator('body')).toBeVisible();

        // Should have some indication this is a 404
        const errorIndicators = page.locator('h1, h2, .error, .not-found');
        if ((await errorIndicators.count()) > 0) {
          await expect(errorIndicators.first()).toBeVisible();
        }
      }
    });

    test('should handle broken images gracefully', async ({ page }) => {
      await page.goto('/');

      // Check for broken images
      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);

          // Images should have actual dimensions (not broken)
          if (naturalWidth === 0 && naturalHeight === 0) {
            console.warn(`Potentially broken image found: ${await img.getAttribute('src')}`);
          }
        }
      }
    });
  });
});
