import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  generateMarkdownSidecars,
  htmlToMarkdown,
} from '../apps/astro-blog/scripts/generate-markdown.mjs';

test('converts semantic main content and omits presentation and behavior noise', () => {
  const html = `<!doctype html>
    <html>
      <head><style>.noise { display: none; }</style></head>
      <body>
        <main>
          <header><h1>Example page</h1><nav>Navigation noise</nav></header>
          <article>
            <h2>Useful content</h2>
            <p>Hello <strong>world</strong>.</p>
            <p>Read <a href="/post/other">the other post</a>.</p>
            <ul><li>First</li><li>Second</li></ul>
            <section class="article-contributors"><p>Contributor noise</p></section>
          </article>
          <footer>Footer noise</footer>
          <script>window.noise = true;</script>
        </main>
      </body>
    </html>`;

  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /^# Example page/m);
  assert.match(markdown, /^## Useful content/m);
  assert.match(markdown, /Hello \*\*world\*\*\./);
  assert.match(markdown, /Read \[the other post\]\(\/post\/other\)/);
  assert.match(markdown, /^- First$/m);
  assert.doesNotMatch(
    markdown,
    /Navigation noise|Contributor noise|Footer noise|window\.noise|display: none/,
  );
});

test('keeps semantic block boundaries and omits generated heading anchors', () => {
  const markdown = htmlToMarkdown(`
    <main>
      <section>
        <div><a href="/">Brand</a></div>
        <p>Lead text</p>
      </section>
      <h2><a class="heading-anchor" href="#lead" aria-label="Lead textへの直接リンク">##</a>Lead heading</h2>
    </main>
  `);

  assert.equal(markdown, '[Brand](/)\n\nLead text\n\n## Lead heading\n');
});

test('extracts article and note content without site chrome or metadata noise', () => {
  const articleMarkdown = htmlToMarkdown(`
    <main>
      <section class="editorial-masthead"><a href="/">Estrilda</a><p>Site tagline</p></section>
      <article>
        <header class="article-hero">
          <div class="article-heading">
            <a class="article-category" href="/category/meta/">Category</a>
            <h1>Article title</h1>
            <p class="article-lead">Article summary</p>
          </div>
          <aside class="article-meta"><dt>PUBLISHED</dt><dd>2025.01.01</dd><img src="cover.jpg" alt="Cover" /></aside>
        </header>
        <div class="article-layout">
          <div class="article-content"><div class="article-body"><h2>Body heading</h2><p>Useful body.</p></div></div>
          <aside class="article-sidebar">Table of contents</aside>
        </div>
        <nav class="article-return">Back</nav>
      </article>
      <footer>Footer</footer>
    </main>
  `);

  assert.equal(
    articleMarkdown,
    '# Article title\n\nArticle summary\n\n## Body heading\n\nUseful body.\n',
  );

  const noteMarkdown = htmlToMarkdown(`
    <main>
      <section class="editorial-masthead">Estrilda</section>
      <article class="note-detail">
        <header><p class="note-kicker">Note</p><div class="note-detail-meta">2025.01.01</div><h1>Note title</h1></header>
        <div class="note-body"><p>Note body.</p></div>
        <ul class="note-detail-tags"><li>#noise</li></ul>
        <nav class="note-detail-actions">Back</nav>
      </article>
      <footer>Footer</footer>
    </main>
  `);

  assert.equal(noteMarkdown, '# Note title\n\nNote body.\n');
});

test('preserves article iframe embeds as labeled Markdown links without presentation noise', () => {
  const markdown = htmlToMarkdown(`
    <main>
      <header><nav>Navigation noise</nav></header>
      <article>
        <h1>Article title</h1>
        <div class="article-body">
          <p>本文</p>
          <div class="youtube-embed">
            <iframe src="https://www.youtube.com/embed/video-123" title="紹介動画"></iframe>
          </div>
          <iframe src="https://example.test/embed/fallback"></iframe>
          <script>window.noise = true;</script>
        </div>
      </article>
      <footer>Footer noise</footer>
    </main>
  `);

  assert.match(markdown, /\[紹介動画\]\(https:\/\/www\.youtube\.com\/embed\/video-123\)/);
  assert.match(markdown, /\[Embedded content\]\(https:\/\/example\.test\/embed\/fallback\)/);
  assert.doesNotMatch(markdown, /Navigation noise|Footer noise|window\.noise/);
});

test('preserves authored inline adjacency in article and note bodies', () => {
  const articleMarkdown = htmlToMarkdown(`
    <main>
      <article>
        <h1>Article title</h1>
        <div class="article-body">
          <p>これは<strong>重要</strong>。<a href="/detail">リンク</a>です。</p>
        </div>
      </article>
    </main>
  `);
  const noteMarkdown = htmlToMarkdown(`
    <main>
      <article>
        <h1>Note title</h1>
        <div class="note-body">
          <p>これは<strong>重要</strong>。<a href="/detail">リンク</a>です。</p>
        </div>
      </article>
    </main>
  `);

  assert.equal(articleMarkdown, '# Article title\n\nこれは**重要**。[リンク](/detail)です。\n');
  assert.equal(noteMarkdown, '# Note title\n\nこれは**重要**。[リンク](/detail)です。\n');
});

test('uses a longer fence when code contains a triple-backtick run', () => {
  const markdown = htmlToMarkdown('<main><pre><code>const fence = "```";</code></pre></main>');

  assert.equal(markdown, '````\nconst fence = "```";\n````\n');
});

test('uses a longer inline delimiter when code contains an internal backtick run', () => {
  const markdown = htmlToMarkdown('<main><p><code>literal ``` run</code></p></main>');

  assert.equal(markdown, '````literal ``` run````\n');
});

test('pads inline code when its content starts and ends with a backtick', () => {
  const markdown = htmlToMarkdown('<main><p><code>`literal`</code></p></main>');

  assert.equal(markdown, '`` `literal` ``\n');
});

test('separates adjacent fields in generic document cards', () => {
  const markdown = htmlToMarkdown(`
    <main>
      <section class="editorial-masthead">Estrilda</section>
      <a href="/post/example">
        <span class="post-date"><time>2025.01.01</time><span>Category</span></span>
        <span class="post-title">Title</span>
        <span class="post-description">Description</span>
        <span class="post-tags"><span>#tag</span></span>
        <span>READ ARTICLE →</span>
      </a>
    </main>
  `);

  assert.equal(markdown, '[2025.01.01 Category Title Description #tag](/post/example)\n');
});

test('writes one Markdown sidecar for every generated HTML route', async () => {
  const distDir = await mkdtemp(path.join(os.tmpdir(), 'dev-22-markdown-'));
  try {
    await mkdir(path.join(distDir, 'notes'), { recursive: true });
    await mkdir(path.join(distDir, 'assets'), { recursive: true });
    await writeFile(path.join(distDir, 'index.html'), '<main><h1>Home</h1></main>');
    await writeFile(path.join(distDir, 'notes', 'index.html'), '<main><h1>Notes</h1></main>');
    await writeFile(path.join(distDir, 'assets', 'example.html'), '<main><h1>Asset</h1></main>');
    await writeFile(path.join(distDir, 'assets', 'app.js'), 'console.log("asset");');

    const generated = await generateMarkdownSidecars(distDir);

    assert.equal(generated, 2);
    assert.equal(await readFile(path.join(distDir, 'index.md'), 'utf8'), '# Home\n');
    assert.equal(await readFile(path.join(distDir, 'notes', 'index.md'), 'utf8'), '# Notes\n');
    await assert.rejects(readFile(path.join(distDir, 'assets', 'example.md')), { code: 'ENOENT' });
  } finally {
    await rm(distDir, { recursive: true, force: true });
  }
});
