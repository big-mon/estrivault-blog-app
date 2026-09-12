import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

test('Astro formatting is stable after one pass with the repository plugins', async () => {
  const source = new URL('../apps/astro-blog/src/', import.meta.url);
  const files = (await readdir(source, { recursive: true })).filter((file) =>
    file.endsWith('.astro'),
  );
  assert.ok(files.length > 0, 'Expected Astro source files');

  for (const file of files) {
    const filepath = fileURLToPath(new URL(file, source));
    const options = { ...(await resolveConfig(filepath)), filepath };
    const formatted = await format(await readFile(filepath, 'utf8'), options);
    assert.equal(await format(formatted, options), formatted, file);
  }
});
