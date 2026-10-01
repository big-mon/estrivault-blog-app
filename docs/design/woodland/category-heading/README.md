# Category page context

Category pages now use a small Japanese 「カテゴリー」 label above the semantic h1, a restrained sage divider, and deliberate heading spacing. The category h1 is 24px; article headings retain their existing typography. Narrow layouts can wrap the category menu below the title without horizontal overflow.

The redundant top article count and page count are omitted only for category pages. Bottom pagination, category descriptions, related tags, URLs, SEO metadata, and article content remain intact. General article archives and tag archives retain their existing context. No scenery or animation files were changed.

Screenshots show top and bottom at 320, 390, 820, and 1440px, category page 2 at 390/1440px, and the longer 「投資・企業分析」 heading at 320px. They are actual local production-build captures in Chromium with reduced motion; widths up to 820 use mobile/touch emulation.

Regression coverage verifies semantic h1/h2 hierarchy, category-only count removal, no overflow, visible bottom pagination, forward/back category pagination, and retained count displays in general/tag archives. Existing notes, motion, footer, and routing tests remain in the full suite. Hosted-preview and Library transfer limitations are recorded in the PR.
