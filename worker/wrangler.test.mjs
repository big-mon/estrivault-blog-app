import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('configures the Worker in front of static assets', async () => {
  const wrangler = await readFile(path.join(repositoryRoot, 'wrangler.toml'), 'utf8');

  assert.match(wrangler, /^main\s*=\s*"worker\/index\.mjs"\s*$/m);
  assert.match(
    wrangler,
    /\[assets\][\s\S]*directory\s*=\s*"apps\/astro-blog\/dist"[\s\S]*binding\s*=\s*"ASSETS"[\s\S]*run_worker_first\s*=\s*true/m,
  );
});
