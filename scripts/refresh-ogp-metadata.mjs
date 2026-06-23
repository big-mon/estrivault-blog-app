import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  createFallbackMetadata,
  fetchFreshOgpMetadata,
  shouldFetchOgp,
} from '../packages/content-processor/dist/index.js';

const DEFAULT_TTL_DAYS = 30;
const DEFAULT_FAILURE_TTL_DAYS = 7;
const DEFAULT_CONCURRENCY = 3;
const STORE_PATH = path.resolve('content', 'ogp-metadata.json');
const CONTENT_ROOTS = [path.resolve('content', 'blog'), path.resolve('content', 'notes')];

function parseArgs(argv) {
  const options = {
    all: false,
    dryRun: false,
    ttlDays: DEFAULT_TTL_DAYS,
    failureTtlDays: DEFAULT_FAILURE_TTL_DAYS,
    concurrency: DEFAULT_CONCURRENCY,
    urls: [],
  };

  for (const arg of argv) {
    if (arg === '--') {
      continue;
    } else if (arg === '--all' || arg === '--force') {
      options.all = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--ttl-days=')) {
      options.ttlDays = Number(arg.slice('--ttl-days='.length));
    } else if (arg.startsWith('--failure-ttl-days=')) {
      options.failureTtlDays = Number(arg.slice('--failure-ttl-days='.length));
    } else if (arg.startsWith('--concurrency=')) {
      options.concurrency = Number(arg.slice('--concurrency='.length));
    } else if (arg.startsWith('--url=')) {
      options.urls.push(arg.slice('--url='.length));
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(options.ttlDays) || options.ttlDays <= 0) {
    throw new Error('--ttl-days must be a positive number');
  }
  if (!Number.isFinite(options.failureTtlDays) || options.failureTtlDays <= 0) {
    throw new Error('--failure-ttl-days must be a positive number');
  }
  if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
    throw new Error('--concurrency must be a positive integer');
  }

  return options;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listMarkdownFiles(root) {
  if (!(await pathExists(root))) {
    return [];
  }

  const entries = await fs.readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        return listMarkdownFiles(entryPath);
      }
      if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
        return [entryPath];
      }
      return [];
    }),
  );

  return nested.flat();
}

function extractStandaloneUrls(markdown) {
  const urls = new Set();

  for (const line of markdown.split(/\r?\n/)) {
    const url = extractStandaloneUrlFromLine(line);
    if (url) {
      urls.add(url);
    }
  }

  return urls;
}

function extractStandaloneUrlFromLine(line) {
  const value = stripMarkdownContainerMarkers(line);
  const bareUrlMatch = value.match(/^<?(https?:\/\/[^\s<>()]+)>?$/);
  if (bareUrlMatch) {
    return bareUrlMatch[1];
  }

  const markdownLinkMatch = value.match(
    /^\[[^\]]+\]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)$/,
  );
  return markdownLinkMatch?.[1] ?? null;
}

function stripMarkdownContainerMarkers(line) {
  let value = line.trim();

  while (value.length > 0) {
    const next = value
      .replace(/^>\s*/, '')
      .replace(/^[-*+]\s+/, '')
      .replace(/^\d+[.)]\s+/, '')
      .trim();

    if (next === value) {
      return value;
    }

    value = next;
  }

  return value;
}

async function discoverUrls() {
  const files = (await Promise.all(CONTENT_ROOTS.map((root) => listMarkdownFiles(root)))).flat();
  const urls = new Set();

  for (const file of files) {
    const markdown = await fs.readFile(file, 'utf8');
    for (const url of extractStandaloneUrls(markdown)) {
      if (shouldFetchOgp(url, { mode: 'fetch' })) {
        urls.add(url);
      }
    }
  }

  return [...urls].sort();
}

async function readStore() {
  if (!(await pathExists(STORE_PATH))) {
    return { version: 1, entries: {} };
  }

  const content = await fs.readFile(STORE_PATH, 'utf8');
  return JSON.parse(content);
}

function isExpired(entry, now) {
  if (!entry?.expiresAt) {
    return true;
  }

  const expiresAt = Date.parse(entry.expiresAt);
  return Number.isNaN(expiresAt) || expiresAt <= now.getTime();
}

function shouldRefresh(url, store, options, now) {
  const entry = store.entries?.[url];
  if (!entry) {
    return true;
  }

  const explicitlyRequested = options.urls.includes(url);
  if (entry.source === 'manual' && !explicitlyRequested) {
    return false;
  }

  if (options.all || explicitlyRequested) {
    return true;
  }

  return isExpired(entry, now);
}

function buildEntry(url, existingEntry, result, now, ttlDays) {
  const attemptedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000).toISOString();

  if (!result || result.status === 'fallback') {
    if (existingEntry) {
      return {
        ...existingEntry,
        expiresAt,
        lastAttemptAt: attemptedAt,
        lastError: result?.error || 'OGP fetch failed',
        status: 'fallback',
      };
    }

    return {
      ...createFallbackMetadata(url),
      fetchedAt: attemptedAt,
      expiresAt,
      lastAttemptAt: attemptedAt,
      lastError: result?.error || 'OGP fetch failed',
      source: 'fallback',
      status: 'fallback',
    };
  }

  return {
    ...result.metadata,
    url: result.metadata.url || url,
    fetchedAt: attemptedAt,
    expiresAt,
    lastAttemptAt: attemptedAt,
    source: 'fetch',
    status: 'ok',
  };
}

async function mapLimit(items, limit, mapper) {
  const results = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));

  return results;
}

function sortEntries(entries) {
  return Object.fromEntries(
    Object.entries(entries).sort(([left], [right]) => left.localeCompare(right)),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const store = await readStore();
  store.version = store.version || 1;
  store.entries = store.entries || {};

  const discoveredUrls = options.urls.length > 0 ? options.urls : await discoverUrls();
  const now = new Date();
  const refreshUrls = discoveredUrls.filter((url) => shouldRefresh(url, store, options, now));

  if (refreshUrls.length === 0) {
    console.log(`OGP metadata is up to date (${discoveredUrls.length} URL(s) scanned)`);
    return;
  }

  console.log(
    `Refreshing ${refreshUrls.length} OGP URL(s) with concurrency ${options.concurrency}`,
  );

  await mapLimit(refreshUrls, options.concurrency, async (url) => {
    const result = await fetchFreshOgpMetadata(url);
    const ttlDays = result?.status === 'fallback' ? options.failureTtlDays : options.ttlDays;
    store.entries[url] = buildEntry(url, store.entries[url], result, new Date(), ttlDays);
    const status = result?.status || 'skipped';
    console.log(`${status}: ${url}`);
  });

  store.entries = sortEntries(store.entries);

  if (options.dryRun) {
    console.log('Dry run complete; metadata store was not written');
    return;
  }

  await fs.writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  console.log(`Updated ${path.relative(process.cwd(), STORE_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
