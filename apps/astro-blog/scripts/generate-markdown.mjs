import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';

const SKIP_TAGS = new Set([
  'script',
  'style',
  'nav',
  'footer',
  'template',
  'noscript',
  'svg',
  'canvas',
]);

const SKIP_CLASSES = new Set([
  'editorial-masthead',
  'article-category',
  'article-meta',
  'article-sidebar',
  'article-return',
  'article-contributors',
  'note-kicker',
  'note-detail-meta',
  'note-detail-tags',
  'note-detail-actions',
  'note-card-more',
  'related-notes',
]);

const SKIP_TEXT = new Set(['READ ARTICLE →']);

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? null;
}

function hasClass(node, className) {
  return (getAttribute(node, 'class') ?? '').split(/\s+/).includes(className);
}

function shouldSkip(node) {
  if (!node || !node.nodeName || node.nodeName.startsWith('#')) {
    return node?.nodeName !== '#text';
  }

  if (SKIP_TAGS.has(node.nodeName)) {
    return true;
  }

  if (getAttribute(node, 'hidden') !== null || getAttribute(node, 'aria-hidden') === 'true') {
    return true;
  }

  if ([...SKIP_CLASSES].some((className) => hasClass(node, className))) {
    return true;
  }

  if (SKIP_TEXT.has(getTextContent(node).replace(/\s+/g, ' ').trim())) {
    return true;
  }

  return (
    hasClass(node, 'heading-anchor') ||
    hasClass(node, 'note-modal-root') ||
    getAttribute(node, 'data-note-modal-root') !== null ||
    getAttribute(node, 'data-note-template') !== null ||
    getAttribute(node, 'data-contributors-api') !== null
  );
}

function findFirst(node, nodeName) {
  if (node?.nodeName === nodeName) {
    return node;
  }

  for (const child of node?.childNodes ?? []) {
    const match = findFirst(child, nodeName);
    if (match) {
      return match;
    }
  }

  return null;
}

function findFirstWithClass(node, className) {
  if (hasClass(node, className)) {
    return node;
  }

  for (const child of node?.childNodes ?? []) {
    const match = findFirstWithClass(child, className);
    if (match) {
      return match;
    }
  }

  return null;
}

function escapeInlineText(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/([*_`[\]~])/g, '\\$1')
    .replace(/<(?=\/?[A-Za-z][A-Za-z0-9-]*(?:\s+[^<>]*)?\/?>)/g, '\\<')
    .replace(/&(?:(?:[A-Za-z][A-Za-z0-9]*)|#(?:\d+|[xX][0-9A-Fa-f]+));/g, '\\$&');
}

function escapeMarkdownDestination(value) {
  return value.replace(/[\\()]/g, '\\$&');
}

function getTextContent(node) {
  if (node?.nodeName === '#text') {
    return node.value;
  }

  return (node?.childNodes ?? []).map(getTextContent).join('');
}

function getFencedCodeTextContent(node) {
  return (node?.childNodes ?? [])
    .filter(
      (child) =>
        child.nodeName !== 'span' ||
        getAttribute(child, 'data-line') !== '' ||
        getTextContent(child) !== ' ',
    )
    .map(getTextContent)
    .join('');
}

function getMaxBacktickRunLength(content) {
  return Math.max(0, ...(content.match(/`+/g) ?? []).map((run) => run.length));
}

function getIframeLabel(node) {
  for (const attribute of ['title', 'aria-label', 'data-title', 'data-label']) {
    const value = getAttribute(node, attribute)?.trim();
    if (value) {
      return escapeInlineText(value);
    }
  }

  return 'Embedded content';
}

function renderInline(node, options = {}) {
  if (node?.nodeName === '#text') {
    return escapeInlineText(node.value);
  }

  if (!node || shouldSkip(node)) {
    return '';
  }

  const tagName = node.nodeName;
  if (tagName === 'br') {
    return '  \n';
  }

  if (tagName === 'input' && getAttribute(node, 'type')?.toLowerCase() === 'checkbox') {
    return getAttribute(node, 'checked') !== null ? '[x]' : '[ ]';
  }

  if (tagName === 'iframe') {
    const src = getAttribute(node, 'src');
    if (!src) {
      return '';
    }
    return `[${getIframeLabel(node)}](${escapeMarkdownDestination(src)})`;
  }

  if (tagName === 'a') {
    const content = renderInlineChildren(node.childNodes, options).trim();
    const href = getAttribute(node, 'href');
    if (!content) {
      return '';
    }
    return href ? `[${content}](${escapeMarkdownDestination(href)})` : content;
  }

  if (tagName === 'img') {
    const src = getAttribute(node, 'src');
    if (!src) {
      return '';
    }
    const alt = (getAttribute(node, 'alt') ?? '').replaceAll('[', '\\[').replaceAll(']', '\\]');
    return `![${alt}](${escapeMarkdownDestination(src)})`;
  }

  if (tagName === 'strong' || tagName === 'b') {
    const content = renderInlineChildren(node.childNodes, options).trim();
    return content ? `**${content}**` : '';
  }

  if (tagName === 'em' || tagName === 'i') {
    const content = renderInlineChildren(node.childNodes, options).trim();
    return content ? `*${content}*` : '';
  }

  if (tagName === 'del' || tagName === 's') {
    const content = renderInlineChildren(node.childNodes, options).trim();
    return content ? `~~${content}~~` : '';
  }

  if (tagName === 'code') {
    const content = getTextContent(node);
    if (!content) {
      return '';
    }

    const delimiter = '`'.repeat(getMaxBacktickRunLength(content) + 1);
    const needsPadding =
      content.startsWith('`') ||
      content.endsWith('`') ||
      (content.startsWith(' ') && content.endsWith(' '));
    const padding = content.trim() && needsPadding ? ' ' : '';
    return `${delimiter}${padding}${content}${padding}${delimiter}`;
  }

  return renderInlineChildren(node.childNodes, options);
}

function renderInlineChildren(nodes = [], options = {}) {
  const parts = nodes.map((node) => renderInline(node, options));
  if (options.insertInlineSeparators === false) {
    return parts.join('');
  }

  return parts.reduce((result, part) => {
    if (!result || !part || /\s$/.test(result) || /^\s/.test(part)) {
      return result + part;
    }

    const startsWithPunctuation = '.,!?;:)]}%'.includes(part[0]);
    const endsWithOpeningPunctuation = '([{'.includes(result[result.length - 1]);
    if (startsWithPunctuation || endsWithOpeningPunctuation) {
      return result + part;
    }

    return `${result} ${part}`;
  }, '');
}

function escapeBlockLeadingSyntax(value) {
  const escapedOrderedMarkers = value.replace(/(^|\n)(\d{1,9})([.)])(?=[ \t]+|$)/g, '$1$2\\$3');
  return escapedOrderedMarkers.replace(
    /(^|\n)(?=(?:#{1,6}(?:[ \t]+|$)|>[ \t]?|[-+](?:[ \t]+|$)|-{3,}[ \t]*(?:\n|$)|<))/g,
    '$1\\',
  );
}

function indentListBlock(content, continuationPrefix) {
  return content.split('\n').map((line) => (line ? `${continuationPrefix}${line}` : line));
}

function renderListItem(item, marker, options = {}) {
  const continuationPrefix = ' '.repeat(`${marker} `.length);
  const parts = [];
  let inlineNodes = [];
  const flushInline = () => {
    const content = escapeBlockLeadingSyntax(renderInlineChildren(inlineNodes, options).trim());
    if (content) {
      parts.push({ content, isList: false });
    }
    inlineNodes = [];
  };

  for (const child of item.childNodes ?? []) {
    const block = child.nodeName === '#text' ? null : renderBlock(child, options);
    if (block === null) {
      inlineNodes.push(child);
      continue;
    }

    flushInline();
    const content = block.trim();
    if (content) {
      parts.push({
        content,
        isList: child.nodeName === 'ul' || child.nodeName === 'ol',
      });
    }
  }
  flushInline();

  if (parts.length === 0) {
    return [marker];
  }

  const lines = [];
  for (const [index, part] of parts.entries()) {
    const contentLines = part.content.split('\n');
    const indentedLines = indentListBlock(part.content, continuationPrefix);
    if (index > 0) {
      lines.push('');
    }

    if (index === 0 && !part.isList) {
      lines.push(`${marker} ${contentLines[0]}`.trimEnd(), ...indentedLines.slice(1));
    } else if (index === 0) {
      lines.push(marker, ...indentedLines);
    } else {
      lines.push(...indentedLines);
    }
  }

  return lines;
}

function renderList(node, options = {}) {
  const items = (node.childNodes ?? []).filter((child) => child.nodeName === 'li');
  if (items.length === 0) {
    return renderBlocks(node.childNodes, options);
  }

  const ordered = node.nodeName === 'ol';
  const startAttribute = getAttribute(node, 'start')?.trim();
  const parsedStart =
    startAttribute && /^-?\d+$/.test(startAttribute) ? Number(startAttribute) : NaN;
  const startingNumber = Number.isSafeInteger(parsedStart) ? parsedStart : 1;
  const lines = [];
  for (const [index, item] of items.entries()) {
    const marker = ordered ? `${startingNumber + index}.` : '-';
    lines.push(...renderListItem(item, marker, options));
  }

  return `${lines.join('\n')}\n\n`;
}

function renderTable(node, options = {}) {
  const rows = [];
  const headerAlignments = [];
  const visit = (current) => {
    if (current.nodeName === 'tr') {
      const cells = (current.childNodes ?? []).filter(
        (child) => child.nodeName === 'th' || child.nodeName === 'td',
      );
      if (cells.length > 0) {
        if (rows.length === 0) {
          headerAlignments.push(
            ...cells.map((cell) => {
              const alignment =
                cell.nodeName === 'th' ? getAttribute(cell, 'align')?.trim().toLowerCase() : null;
              return (
                alignment === 'left' ? ':---'
                : alignment === 'center' ? ':---:'
                : alignment === 'right' ? '---:'
                : '---'
              );
            }),
          );
        }
        rows.push(
          cells.map((cell) =>
            renderInlineChildren(cell.childNodes, options)
              .replace(/ {2}\n/g, '<br>')
              .replace(/\s+/g, ' ')
              .replace(/\|/g, '\\|')
              .trim(),
          ),
        );
      }
      return;
    }

    for (const child of current.childNodes ?? []) {
      visit(child);
    }
  };
  visit(node);

  if (rows.length === 0) {
    return '';
  }

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) => [...row, ...Array(columnCount - row.length).fill('')]);
  const header = `| ${normalizedRows[0].join(' | ')} |`;
  const separator = `| ${Array.from({ length: columnCount }, (_, index) => headerAlignments[index] ?? '---').join(' | ')} |`;
  const body = normalizedRows.slice(1).map((row) => `| ${row.join(' | ')} |`);
  return `${[header, separator, ...body].join('\n')}\n\n`;
}

function renderBlock(node, options = {}) {
  if (!node || shouldSkip(node)) {
    return '';
  }

  if (node.nodeName === '#text') {
    return node.value.trim() ? renderInline(node, options) : '';
  }

  const tagName = node.nodeName;
  if (/^h[1-6]$/.test(tagName)) {
    const content = renderInlineChildren(node.childNodes, options).trim();
    return content ? `${'#'.repeat(Number(tagName.slice(1)))} ${content}\n\n` : '';
  }

  if (tagName === 'p' || tagName === 'figcaption' || tagName === 'dt' || tagName === 'dd') {
    const content = escapeBlockLeadingSyntax(renderInlineChildren(node.childNodes, options).trim());
    return content ? `${content}\n\n` : '';
  }

  if (tagName === 'ul' || tagName === 'ol') {
    return renderList(node, options);
  }

  if (tagName === 'blockquote') {
    const content = renderBlocks(node.childNodes, options).trim();
    return content ?
        `${content
          .split('\n')
          .map((line) => (line ? `> ${line}` : '>'))
          .join('\n')}\n\n`
      : '';
  }

  if (tagName === 'pre') {
    const code = findFirst(node, 'code') ?? node;
    const language =
      getAttribute(code, 'data-language')?.trim() ||
      getAttribute(node, 'data-language')?.trim() ||
      (getAttribute(code, 'class') ?? '').match(/(?:^|\s)language-([^\s]+)/)?.[1] ||
      '';
    const content = getFencedCodeTextContent(code);
    const fence = '`'.repeat(Math.max(3, getMaxBacktickRunLength(content) + 1));
    return `${fence}${language}\n${content}\n${fence}\n\n`;
  }

  if (tagName === 'table') {
    return renderTable(node, options);
  }

  if (tagName === 'hr') {
    return '---\n\n';
  }

  if (tagName === 'div') {
    const directiveType = getAttribute(node, 'data-directive-type')?.trim().toLowerCase();
    if (['info', 'alert', 'warn'].includes(directiveType)) {
      const content = renderBlocks(node.childNodes, options).trim();
      const lines = [`> [!${directiveType.toUpperCase()}]`];
      if (content) {
        lines.push(...content.split('\n').map((line) => (line ? `> ${line}` : '>')));
      }
      return `${lines.join('\n')}\n\n`;
    }
  }

  if (
    new Set([
      'html',
      'head',
      'body',
      'main',
      'article',
      'section',
      'header',
      'div',
      'aside',
      'figure',
      'dl',
      'details',
      'summary',
    ]).has(tagName)
  ) {
    return renderBlocks(node.childNodes, options);
  }

  return null;
}

function joinRenderedBlocks(blocks = []) {
  return blocks.filter(Boolean).reduce((result, block) => {
    if (!result) {
      return block;
    }

    const separator =
      result.endsWith('\n\n') ? ''
      : result.endsWith('\n') ? '\n'
      : '\n\n';
    return result + separator + block;
  }, '');
}

function renderBlocks(nodes = [], options = {}) {
  return joinRenderedBlocks(
    nodes.map((node) => {
      const block = renderBlock(node, options);
      return block === null ? renderInline(node, options) : block;
    }),
  );
}

export function htmlToMarkdown(html) {
  const document = parse(html);
  const main = findFirst(document, 'main') ?? findFirst(document, 'body') ?? document;
  const articleBody = findFirstWithClass(main, 'article-body');
  const noteBody = findFirstWithClass(main, 'note-body');
  const contentRoot = articleBody ?? noteBody;
  const content =
    contentRoot ?
      joinRenderedBlocks(
        [findFirst(main, 'h1'), findFirstWithClass(main, 'article-lead'), contentRoot]
          .filter(Boolean)
          .map((node) =>
            node === contentRoot ?
              renderBlocks(node.childNodes, { insertInlineSeparators: false })
            : renderBlock(node),
          ),
      )
    : renderBlocks(main.childNodes);
  const markdown = content.trim();

  return markdown ? `${markdown}\n` : '';
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name === 'index.html') {
      files.push(entryPath);
    }
  }
  return files.sort();
}

export async function generateMarkdownSidecars(distDir = path.resolve(process.cwd(), 'dist')) {
  const htmlFiles = await findHtmlFiles(distDir);
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    const markdownFile = htmlFile.slice(0, -'.html'.length) + '.md';
    await writeFile(markdownFile, htmlToMarkdown(html), 'utf8');
  }
  return htmlFiles.length;
}

const invokedFile = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedFile === import.meta.url) {
  const distDir = path.resolve(process.cwd(), 'dist');
  const generated = await generateMarkdownSidecars(distDir);
  process.stdout.write(`Generated ${generated} Markdown sidecars in ${distDir}\n`);
}
