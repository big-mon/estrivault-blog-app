import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptsMarkdown, getMarkdownAssetPath } from './markdown-negotiation.mjs';

test('accepts an explicit text/markdown item with a positive q value', () => {
  assert.equal(acceptsMarkdown('text/html, text/markdown;q=0.7, application/xhtml+xml'), true);
  assert.equal(acceptsMarkdown('TEXT/MARKDOWN; Q=0.5'), true);
});

test('does not treat q=0 or a wildcard as explicit Markdown acceptance', () => {
  assert.equal(acceptsMarkdown('text/markdown;q=0, text/html;q=1'), false);
  assert.equal(acceptsMarkdown('text/markdown; q=0.0, text/markdown;q=0.6'), true);
  assert.equal(acceptsMarkdown('text/html,application/xhtml+xml, */*;q=0.8'), false);
  assert.equal(acceptsMarkdown('text/*;q=1'), false);
  assert.equal(acceptsMarkdown(undefined), false);
});

test('maps canonical document URLs to their Markdown sidecars', () => {
  assert.equal(getMarkdownAssetPath('/'), '/index.md');
  assert.equal(getMarkdownAssetPath('/post/about'), '/post/about/index.md');
  assert.equal(getMarkdownAssetPath('/notes/'), '/notes/index.md');
  assert.equal(getMarkdownAssetPath('/post/about/index.html'), '/post/about/index.md');
  assert.equal(getMarkdownAssetPath('/_astro/site.css'), null);
  assert.equal(getMarkdownAssetPath('/llms.txt'), null);
});
