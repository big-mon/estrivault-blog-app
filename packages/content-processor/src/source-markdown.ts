import { unified } from 'unified';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { decodeString } from 'micromark-util-decode-string';
import { visit } from 'unist-util-visit';
import type { Definition, Heading, Image, ImageReference, Root } from 'mdast';
import type { Node, Parent } from 'unist';
import { parseFrontmatter } from './processor';
import matter from 'gray-matter';
import { resolveBodyImageUrl } from './plugins/transforms/image-transform';
import type { ProcessorOptions } from './types';

interface DirectiveNode extends Parent {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  attributes?: Record<string, string | null | undefined>;
}

interface SourceRange {
  start: number;
  end: number;
}

interface Replacement extends SourceRange {
  value: string;
}

interface SourceLine extends SourceRange {
  text: string;
}

type DefinitionContext = Map<string, { url: string; title: string | null; source: string }>;

const directiveParser = unified().use(remarkParse).use(remarkDirective).use(remarkGfm);
const LEAF_LIKE_DIRECTIVES = new Set(['amazon', 'youtube', 'twitter']);
const FALLBACK_CALLOUT_NAMES = new Set(['info', 'warn', 'alert', 'message']);

/**
 * Source-native Markdownで公開してよい本文へ変換する。
 *
 * 本文の再シリアライズは行わず、remarkのASTが持つソース位置だけを使って、
 * 見出しとディレクティブの該当範囲を置換する。これにより、通常のMarkdownや
 * fenced code blockのバイト列を不要に整形しない。
 */
export function renderPublicMarkdownBody(
  source: string,
  title: string,
  options: ProcessorOptions = {},
): string {
  const { content: markdown } = parseFrontmatter(source);
  const body = renderMarkdownBody(markdown, options);
  const generatedHeading = `# ${title.replace(/[\r\n]+/g, ' ').trim()}`;

  return body ? `${generatedHeading}\n\n${body}` : `${generatedHeading}\n`;
}

function renderMarkdownBody(
  markdown: string,
  options: ProcessorOptions = {},
  inheritedDefinitions: DefinitionContext = new Map(),
): string {
  const tree = parseMarkdown(markdown, inheritedDefinitions);
  const definitions = new Map(inheritedDefinitions);
  collectDefinitionContext(tree, definitions, markdown, markdown.length);
  const replacements: Replacement[] = [];
  const codeRanges = collectCodeRanges(tree);
  const directiveOpenings = collectDirectiveOpenings(tree, markdown);
  const directiveStarts = collectDirectiveStarts(tree);
  const hasSourceH1 = hasHeading(tree, 1);

  visit(tree, (node: Node) => {
    if (isDirectiveNode(node)) {
      const range = getDirectiveRange(node, markdown, directiveOpenings, codeRanges);
      const value = renderDirective(node, markdown, range, options, definitions);
      replacements.push({ ...range, value });
      return;
    }

    if (isImage(node)) {
      const replacement = projectImage(node, markdown, options);
      if (replacement) {
        replacements.push(replacement);
      }
      return;
    }

    if (isImageReference(node)) {
      const replacement = projectImageReference(node, markdown, options, definitions);
      if (replacement) {
        replacements.push(replacement);
      }
      return;
    }

    if (hasSourceH1 && isHeading(node) && node.depth < 6) {
      const replacement = demoteAtxHeading(node, markdown) ?? demoteSetextH1(node, markdown);
      if (replacement) {
        replacements.push(replacement);
      }
    }
  });

  const fallbackReplacements = collectFallbackReplacements(
    markdown,
    directiveStarts,
    codeRanges,
    options,
    definitions,
  );
  const body = applyReplacements(
    markdown,
    selectNonOverlappingReplacements([...replacements, ...fallbackReplacements]),
  );
  return body;
}

function parseMarkdown(markdown: string, inheritedDefinitions: DefinitionContext): Root {
  if (!inheritedDefinitions.size) {
    return directiveParser.parse(markdown) as Root;
  }

  const definitionStubs = [...inheritedDefinitions.values()]
    .map((definition) => definition.source)
    .join('\n');
  return directiveParser.parse(
    `${markdown}${markdown.endsWith('\n') ? '\n' : '\n\n'}${definitionStubs}`,
  ) as Root;
}

function collectDefinitionContext(
  tree: Root,
  definitions: DefinitionContext,
  source: string,
  sourceLength: number,
): void {
  visit(tree, 'definition', (node) => {
    const definition = node as Definition;
    const start = definition.position?.start.offset ?? sourceLength;
    const end = definition.position?.end.offset;
    if (start >= sourceLength || end === undefined || end > source.length) return;
    if (definitions.has(definition.identifier)) return;
    definitions.set(definition.identifier, {
      url: definition.url,
      title: definition.title ?? null,
      source: source.slice(start, end),
    });
  });
}

/**
 * 既存のgray-matter依存をYAMLシリアライザとして使い、公開用allowlistを出力する。
 */
export function serializePublicMarkdown(metadata: Record<string, unknown>, body: string): string {
  return matter.stringify(body, metadata);
}

function collectCodeRanges(tree: Root): SourceRange[] {
  const ranges: SourceRange[] = [];

  visit(tree, 'code', (node) => {
    const range = getNodeRange(node);
    if (range) {
      ranges.push(range);
    }
  });

  return ranges;
}

function collectDirectiveStarts(tree: Root): Set<number> {
  const starts = new Set<number>();

  visit(tree, (node: Node) => {
    if (!isDirectiveNode(node)) {
      return;
    }

    const range = getNodeRange(node);
    if (range) {
      starts.add(range.start);
    }
  });

  return starts;
}

function collectFallbackReplacements(
  source: string,
  directiveStarts: Set<number>,
  codeRanges: SourceRange[],
  options: ProcessorOptions,
  definitions: DefinitionContext,
): Replacement[] {
  const lines = collectSourceLines(source);
  const replacements: Replacement[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line) {
      continue;
    }

    if (isInsideRange(line.start, codeRanges)) {
      continue;
    }

    const marker = parseFallbackDirectiveLine(line.text);
    if (!marker || !isDirectiveLikeSuffix(marker.suffix)) {
      continue;
    }

    const markerStart = line.start + marker.offset;

    if (FALLBACK_CALLOUT_NAMES.has(marker.name) && marker.colonCount === 2) {
      const closing = findLegacyCalloutClosing(lines, index + 1, codeRanges);
      if (!closing) {
        continue;
      }

      replacements.push({
        start: markerStart,
        end: closing.end,
        value: renderBlockquote(
          getDirectiveLabel(marker.name),
          renderMarkdownBody(
            getDelimitedBody(source, markerStart, closing.start),
            options,
            definitions,
          ),
        ),
      });
      continue;
    }

    if (!LEAF_LIKE_DIRECTIVES.has(marker.name) || directiveStarts.has(markerStart)) {
      continue;
    }

    replacements.push({
      start: markerStart,
      end: line.end,
      value: renderFallbackLeafDirective(marker.name, marker.suffix),
    });
  }

  return replacements;
}

function collectSourceLines(source: string): SourceLine[] {
  const lines: SourceLine[] = [];

  for (let start = 0; start <= source.length;) {
    const end = getLineEnd(source, start);
    lines.push({ start, end, text: source.slice(start, end) });

    if (end >= source.length) {
      break;
    }

    start = getLineBreakEnd(source, end);
  }

  return lines;
}

function parseFallbackDirectiveLine(
  line: string,
): { colonCount: number; name: string; offset: number; suffix: string } | null {
  const match = line.match(/^[ \t]*(:{2,})(amazon|youtube|twitter|info|warn|alert|message)\b(.*)$/);
  if (!match || !match[1] || !match[2]) {
    return null;
  }

  return {
    colonCount: match[1].length,
    name: match[2],
    offset: match[0].indexOf(match[1]),
    suffix: match[3] ?? '',
  };
}

function isDirectiveLikeSuffix(suffix: string): boolean {
  const trimmed = suffix.trim();
  return trimmed === '' || trimmed.startsWith('{');
}

function findLegacyCalloutClosing(
  lines: SourceLine[],
  startIndex: number,
  codeRanges: SourceRange[],
): SourceLine | null {
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line) {
      continue;
    }

    if (isInsideRange(line.start, codeRanges)) {
      continue;
    }

    if (/^[ \t]*:{2}[ \t]*$/.test(line.text)) {
      return line;
    }
  }

  return null;
}

function renderFallbackLeafDirective(name: string, suffix: string): string {
  if (name === 'amazon') {
    return '';
  }

  const id = getSourceAttribute(suffix, 'id');
  assertDirectiveId(name, id);

  if (name === 'youtube') {
    return `[YouTube動画](https://www.youtube.com/watch?v=${encodeURIComponent(id)})`;
  }

  return `[Xの投稿](https://x.com/i/status/${encodeURIComponent(id)})`;
}

function getSourceAttribute(source: string, name: string): string | undefined {
  const match = source.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s}]+))`));
  const value = match?.[1] ?? match?.[2] ?? match?.[3];
  return value?.trim();
}

function collectDirectiveOpenings(tree: Root, source: string): Map<number, number> {
  const openings = new Map<number, number>();

  visit(tree, (node: Node) => {
    if (!isDirectiveNode(node) || node.type !== 'containerDirective') {
      return;
    }

    const range = getNodeRange(node);
    if (!range) {
      return;
    }

    const line = source.slice(range.start, getLineEnd(source, range.start));
    const colonMatch = line.match(/^\s*(:{3,})/);
    if (colonMatch?.[1]) {
      openings.set(range.start, colonMatch[1].length);
    }
  });

  return openings;
}

function hasHeading(tree: Root, depth: number): boolean {
  let found = false;

  visit(tree, (node: Node) => {
    if (found || !isHeading(node) || node.depth !== depth) {
      return;
    }
    found = true;
  });

  return found;
}

function demoteAtxHeading(node: Heading, source: string): Replacement | null {
  const range = getNodeRange(node);
  if (!range) {
    return null;
  }

  const lineEnd = getLineEnd(source, range.start);
  const line = source.slice(range.start, lineEnd);
  const match = line.match(/^(\s{0,3})(#{1,6})(?=[ \t]|$)/);
  if (!match || match[1] === undefined || match[2] === undefined || node.depth >= 6) {
    return null;
  }

  const prefixLength = match[1].length + match[2].length;
  const value = `${match[1]}${'#'.repeat(match[2].length + 1)}`;
  return { start: range.start, end: range.start + prefixLength, value };
}

function demoteSetextH1(node: Heading, source: string): Replacement | null {
  if (node.depth !== 1) {
    return null;
  }

  const range = getNodeRange(node);
  if (!range) {
    return null;
  }

  const underlineStart = getLineStart(source, range.end);
  const underlineEnd = getLineEnd(source, underlineStart);
  const underline = source.slice(underlineStart, underlineEnd);
  if (!/^\s*=+\s*$/.test(underline)) {
    return null;
  }

  return {
    start: underlineStart,
    end: underlineEnd,
    value: underline.replace(/=/g, '-'),
  };
}

function getDirectiveRange(
  node: DirectiveNode,
  source: string,
  openings: Map<number, number>,
  codeRanges: SourceRange[],
): SourceRange {
  const range = getNodeRange(node);
  if (!range || node.type !== 'containerDirective') {
    return range ?? { start: 0, end: 0 };
  }

  const openingEnd = getLineEnd(source, range.start);
  const opening = openings.get(range.start);
  if (!opening) {
    return { start: range.start, end: openingEnd };
  }

  const closing = findClosingDirective(source, range.start, opening, openings, codeRanges);

  if (!closing) {
    return {
      start: range.start,
      end: node.name === 'youtube' || node.name === 'twitter' ? openingEnd : range.end,
    };
  }

  return { start: range.start, end: closing.end };
}

function findClosingDirective(
  source: string,
  openingStart: number,
  openingColonCount: number,
  openings: Map<number, number>,
  codeRanges: SourceRange[],
): SourceRange | null {
  const stack: number[] = [openingColonCount];
  let cursor = getLineEnd(source, openingStart);
  cursor = getLineBreakEnd(source, cursor);

  while (cursor <= source.length) {
    const lineEnd = getLineEnd(source, cursor);
    const line = source.slice(cursor, lineEnd);
    const opening = openings.get(cursor);

    if (!isInsideRange(cursor, codeRanges)) {
      if (opening) {
        stack.push(opening);
      } else {
        const closingMatch = line.match(/^\s*(:{3,})[ \t]*$/);
        const requiredColonCount = stack.at(-1);
        if (closingMatch?.[1] && requiredColonCount !== undefined) {
          if (closingMatch[1].length >= requiredColonCount) {
            stack.pop();
            if (stack.length === 0) {
              return { start: cursor, end: lineEnd };
            }
          }
        }
      }
    }

    if (lineEnd >= source.length) break;
    cursor = getLineBreakEnd(source, lineEnd);
  }

  return null;
}

function renderDirective(
  node: DirectiveNode,
  source: string,
  range: SourceRange,
  options: ProcessorOptions,
  definitions: DefinitionContext,
): string {
  const id = getDirectiveAttribute(node, 'id');

  if (node.name === 'amazon') {
    return '';
  }

  if (node.name === 'youtube') {
    assertDirectiveId(node.name, id);
    return `[YouTube動画](https://www.youtube.com/watch?v=${encodeURIComponent(id)})`;
  }

  if (node.name === 'twitter') {
    assertDirectiveId(node.name, id);
    return `[Xの投稿](https://x.com/i/status/${encodeURIComponent(id)})`;
  }

  if (node.type !== 'containerDirective') {
    return source.slice(range.start, range.end);
  }

  const label = getDirectiveLabel(node.name);
  const body = renderMarkdownBody(getContainerBody(source, range), options, definitions);
  return renderBlockquote(label, body);
}

function getDirectiveLabel(name: string): string {
  if (name === 'info') return 'Info';
  if (name === 'warn' || name === 'alert') return 'Warning';
  if (name === 'message') return 'Note';
  return name;
}

function getContainerBody(source: string, range: SourceRange): string {
  const openingEnd = getLineEnd(source, range.start);
  const bodyStart = getLineBreakEnd(source, openingEnd);
  const closingStart = getLineStart(source, range.end);
  const closingLine = source.slice(closingStart, getLineEnd(source, closingStart));
  const hasClosing = /^\s*:{3,}[ \t]*$/.test(closingLine);
  const bodyEnd = hasClosing ? closingStart : range.end;

  if (bodyEnd <= bodyStart || bodyEnd > range.end) {
    return '';
  }

  return getDelimitedBody(source, range.start, bodyEnd);
}

function getDelimitedBody(source: string, openingStart: number, closingStart: number): string {
  const openingEnd = getLineEnd(source, openingStart);
  const bodyStart = getLineBreakEnd(source, openingEnd);

  if (closingStart <= bodyStart) {
    return '';
  }

  return removeOneLineEnding(source.slice(bodyStart, closingStart));
}

function renderBlockquote(label: string, body: string): string {
  const lines = body ? body.split(/\r\n|\n|\r/) : [];
  return [
    `> **${label}**`,
    ...(lines.length > 0 ? ['>', ...lines.map((line) => (line ? `> ${line}` : '>'))] : []),
  ].join('\n');
}

function getDirectiveAttribute(node: DirectiveNode, name: string): string | undefined {
  const value = node.attributes?.[name];
  return typeof value === 'string' ? value.trim() : undefined;
}

function assertDirectiveId(name: string, id: string | undefined): asserts id is string {
  if (!id) {
    throw new Error(`${name} directive requires a non-empty id attribute`);
  }
}

function isDirectiveNode(node: Node): node is DirectiveNode {
  return (
    (node.type === 'containerDirective' ||
      node.type === 'leafDirective' ||
      node.type === 'textDirective') &&
    'name' in node &&
    typeof node.name === 'string'
  );
}

function isHeading(node: Node): node is Heading {
  return node.type === 'heading' && 'depth' in node && typeof node.depth === 'number';
}

function isImage(node: Node): node is Image {
  return node.type === 'image' && 'url' in node && typeof node.url === 'string';
}

function isImageReference(node: Node): node is ImageReference {
  return node.type === 'imageReference' && 'identifier' in node;
}

function projectImage(node: Image, source: string, options: ProcessorOptions): Replacement | null {
  const resolvedUrl = resolveBodyImageUrl(node.url, options.cloudinaryCloudName);
  if (resolvedUrl === node.url) {
    return null;
  }

  const range = getNodeRange(node);
  if (!range) {
    throw new Error('Markdown image transformation requires a source position');
  }

  const destination = locateImageDestination(source, range, node.url);
  return { ...destination, value: resolvedUrl };
}

function projectImageReference(
  node: ImageReference,
  source: string,
  options: ProcessorOptions,
  definitions: DefinitionContext,
): Replacement | null {
  const definition = definitions.get(node.identifier);
  if (!definition) return null;

  const resolvedUrl = resolveBodyImageUrl(definition.url, options.cloudinaryCloudName);
  if (resolvedUrl === definition.url) return null;

  const range = getNodeRange(node);
  if (!range) throw new Error('Markdown image reference transformation requires a source position');

  const nodeSource = source.slice(range.start, range.end);
  const rawLabel = nodeSource.slice(0, locateImageLabelEnd(nodeSource, range, definition.url) + 1);

  return {
    ...range,
    value: `${rawLabel}(${resolvedUrl}${serializeImageTitle(definition.title)})`,
  };
}

function serializeImageTitle(title: string | null): string {
  return title === null ? '' : ` "${title.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function locateImageDestination(
  source: string,
  range: SourceRange,
  destination: string,
): SourceRange {
  const nodeSource = source.slice(range.start, range.end);
  const labelEnd = locateImageLabelEnd(nodeSource, range, destination);
  if (nodeSource[labelEnd + 1] !== '(') {
    throw new Error(
      `Markdown image destination ${JSON.stringify(destination)} cannot be located after the inline image label in source range ${range.start}-${range.end}`,
    );
  }

  let destinationStart = labelEnd + 2;
  while (/[ \t\r\n]/.test(nodeSource[destinationStart] ?? '')) {
    destinationStart += 1;
  }

  const lexicalDestination = scanDestination(nodeSource, destinationStart, range, destination);
  assertDecodedDestination(nodeSource, lexicalDestination, destination, range);
  assertDestinationBoundary(nodeSource, lexicalDestination.after, destination, range);

  return {
    start: range.start + lexicalDestination.start,
    end: range.start + lexicalDestination.end,
  };
}

function locateImageLabelEnd(nodeSource: string, range: SourceRange, destination: string): number {
  if (nodeSource[0] !== '!' || nodeSource[1] !== '[') {
    throw new Error(
      `Markdown image destination ${JSON.stringify(destination)} has an unsupported inline image source range ${range.start}-${range.end}`,
    );
  }

  let labelDepth = 1;
  for (let index = 2; index < nodeSource.length; index += 1) {
    const character = nodeSource[index];
    if (character === '\\') {
      index += 1;
      continue;
    }
    if (character === '[') {
      labelDepth += 1;
    } else if (character === ']') {
      labelDepth -= 1;
      if (labelDepth === 0) {
        return index;
      }
    }
  }

  throw new Error(
    `Markdown image destination ${JSON.stringify(destination)} cannot be located after the inline image label in source range ${range.start}-${range.end}`,
  );
}

function scanDestination(
  nodeSource: string,
  destinationStart: number,
  range: SourceRange,
  destination: string,
): SourceRange & { after: number } {
  const hasAngleBrackets = nodeSource[destinationStart] === '<';
  const destinationStartOffset = hasAngleBrackets ? 1 : 0;
  const contentStart = destinationStart + destinationStartOffset;
  let parenthesisDepth = 0;

  for (let index = contentStart; index < nodeSource.length; index += 1) {
    const character = nodeSource[index];

    if (character === '\\') {
      if (index + 1 >= nodeSource.length) {
        throw new Error(
          `Markdown image destination ${JSON.stringify(destination)} has a trailing escape in its ${hasAngleBrackets ? 'angle-bracket' : 'bare'} destination in source range ${range.start}-${range.end}`,
        );
      }
      if (decodeString(nodeSource.slice(index, index + 2)) === nodeSource[index + 1]) {
        index += 1;
      }
      continue;
    }

    if (hasAngleBrackets) {
      if (character === '<') {
        throw new Error(
          `Markdown image destination ${JSON.stringify(destination)} has an unescaped < in its angle-bracket destination in source range ${range.start}-${range.end}`,
        );
      }
      if (character === '>') {
        return { start: contentStart, end: index, after: index + 1 };
      }
      continue;
    }

    if (/[ \t\r\n]/.test(character ?? '')) {
      if (parenthesisDepth > 0) {
        throw new Error(
          `Markdown image destination ${JSON.stringify(destination)} has unbalanced parentheses before destination whitespace in source range ${range.start}-${range.end}`,
        );
      }
      return { start: destinationStart, end: index, after: index };
    }

    if (character === '(') {
      parenthesisDepth += 1;
      continue;
    }

    if (character === ')') {
      if (parenthesisDepth === 0) {
        return { start: destinationStart, end: index, after: index };
      }
      parenthesisDepth -= 1;
    }
  }

  if (hasAngleBrackets) {
    throw new Error(
      `Markdown image destination ${JSON.stringify(destination)} has an unterminated angle-bracket destination in source range ${range.start}-${range.end}`,
    );
  }

  if (parenthesisDepth > 0) {
    throw new Error(
      `Markdown image destination ${JSON.stringify(destination)} has unbalanced parentheses in its bare destination in source range ${range.start}-${range.end}`,
    );
  }

  throw new Error(
    `Markdown image destination ${JSON.stringify(destination)} has no syntactic closing parenthesis in source range ${range.start}-${range.end}`,
  );
}

function assertDecodedDestination(
  nodeSource: string,
  lexicalDestination: SourceRange & { after: number },
  destination: string,
  range: SourceRange,
): void {
  const rawDestination = nodeSource.slice(lexicalDestination.start, lexicalDestination.end);
  const decodedDestination = decodeString(rawDestination);

  if (decodedDestination !== destination) {
    throw new Error(
      `Markdown image destination ${JSON.stringify(destination)} cannot be safely matched: decoded lexical destination ${JSON.stringify(decodedDestination)} differs in source range ${range.start}-${range.end}`,
    );
  }
}

function assertDestinationBoundary(
  nodeSource: string,
  afterDestination: number,
  destination: string,
  range: SourceRange,
): void {
  const boundary = nodeSource[afterDestination];
  if (boundary !== ')' && !/[ \t\r\n]/.test(boundary ?? '')) {
    throw new Error(
      `Markdown image destination ${JSON.stringify(destination)} has an unsafe inline source boundary in source range ${range.start}-${range.end}`,
    );
  }

  if (boundary !== ')' && !nodeSource.endsWith(')')) {
    throw new Error(
      `Markdown image destination ${JSON.stringify(destination)} has malformed inline image delimiters in source range ${range.start}-${range.end}`,
    );
  }
}

function getNodeRange(node: Node): SourceRange | null {
  const position = node.position;
  if (!position) return null;

  const start = position.start.offset;
  const end = position.end.offset;
  if (start === undefined || end === undefined) return null;

  return { start, end };
}

function getLineEnd(source: string, offset: number): number {
  const newline = source.indexOf('\n', offset);
  if (newline === -1) {
    return source.endsWith('\r') ? source.length - 1 : source.length;
  }

  return source[newline - 1] === '\r' ? newline - 1 : newline;
}

function getLineBreakEnd(source: string, lineEnd: number): number {
  if (source[lineEnd] === '\r' && source[lineEnd + 1] === '\n') return lineEnd + 2;
  if (source[lineEnd] === '\r' || source[lineEnd] === '\n') return lineEnd + 1;
  return lineEnd;
}

function getLineStart(source: string, offset: number): number {
  const newline = source.lastIndexOf('\n', Math.max(0, offset - 1));
  return newline === -1 ? 0 : newline + 1;
}

function removeOneLineEnding(value: string): string {
  if (value.endsWith('\r\n')) return value.slice(0, -2);
  if (value.endsWith('\r') || value.endsWith('\n')) return value.slice(0, -1);
  return value;
}

function isInsideRange(offset: number, ranges: SourceRange[]): boolean {
  return ranges.some((range) => offset >= range.start && offset < range.end);
}

function selectNonOverlappingReplacements(replacements: Replacement[]): Replacement[] {
  const ordered = [...replacements].sort((a, b) => a.start - b.start || b.end - a.end);
  const selected: Replacement[] = [];

  for (const replacement of ordered) {
    const previous = selected.at(-1);
    if (previous && replacement.start < previous.end) {
      continue;
    }
    selected.push(replacement);
  }

  return selected;
}

function applyReplacements(source: string, replacements: Replacement[]): string {
  let result = source;
  for (const replacement of [...replacements].sort((a, b) => b.start - a.start)) {
    result = result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end);
  }
  return result;
}
