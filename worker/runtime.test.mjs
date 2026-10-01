import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile, readdir, rename } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'apps/astro-blog/dist');
const require = createRequire(import.meta.url);
const cf = path.join(path.dirname(require.resolve('cf/package.json')), 'bin/cf');

test(
  'cf local runtime serves the built Worker and real ASSETS',
  { timeout: 180_000 },
  async (t) => {
    const socket = createServer();
    socket.listen(0, '127.0.0.1');
    await once(socket, 'listening');
    const port = socket.address().port;
    await new Promise((resolve) => socket.close(resolve));
    const origin = `http://127.0.0.1:${port}`;
    const server = spawn(process.execPath, [cf, 'dev', '--port', String(port)], {
      cwd: root,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        CF_SEND_TELEMETRY: 'false',
        WRANGLER_SEND_METRICS: 'false',
        ASTRO_TELEMETRY_DISABLED: '1',
      },
    });
    let output = '';
    for (const stream of [server.stdout, server.stderr]) {
      stream.on('data', (chunk) => {
        output = (output + chunk).slice(-8000);
      });
    }
    t.after(async () => {
      const stop = (signal) => {
        try {
          if (process.platform === 'win32') server.kill(signal);
          else process.kill(-server.pid, signal);
        } catch (error) {
          if (error.code !== 'ESRCH') throw error;
        }
      };
      const closed = once(server, 'close');
      stop('SIGTERM');
      await Promise.race([closed, delay(2000)]);
      stop('SIGKILL');
    });

    const request = (pathname, accept = 'text/html', method = 'GET') =>
      fetch(`${origin}${pathname}`, {
        headers: { Accept: accept },
        method,
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
      });
    const deadline = Date.now() + 150_000;
    let ready = false;
    while (Date.now() < deadline && !t.signal.aborted) {
      assert.equal(server.exitCode, null, output);
      try {
        const response = await request('/');
        await response.arrayBuffer();
        ready = response.ok;
      } catch {
        // Wait for workerd to bind its local HTTP port.
      }
      if (ready) break;
      await delay(300, undefined, { signal: t.signal });
    }
    assert.ok(ready, `cf dev did not become ready:\n${output}`);

    const documentHeaders = (response, mediaType) => {
      assert.match(response.headers.get('Content-Type'), new RegExp(`^${mediaType}`));
      assert.equal(response.headers.get('Content-Language'), 'ja');
      assert.ok(response.headers.get('Vary').split(/,\s*/).includes('Accept'));
    };
    const routes = ['/'];
    for (const kind of ['post', 'notes']) {
      const entries = await readdir(path.join(dist, kind), { withFileTypes: true });
      const slug = entries.find((entry) => entry.isDirectory()).name;
      routes.push(`/${kind}/${encodeURIComponent(slug)}`);
    }

    for (const route of routes) {
      const artifact = route === '/' ? '/index.md' : `${route}/index.md`;
      await t.test(`${route}: HTML, Markdown, Accept preference, and HEAD`, async () => {
        const html = await request(route);
        assert.equal(html.status, 200);
        documentHeaders(html, 'text/html');
        assert.ok(html.headers.get('Link').includes(`<${artifact}>; rel="alternate"`));
        assert.match(await html.text(), /<!doctype html>/i);

        const markdown = await request(route, 'text/markdown');
        assert.equal(markdown.status, 200);
        documentHeaders(markdown, 'text/markdown');
        assert.equal(
          await markdown.text(),
          await readFile(path.join(dist, decodeURIComponent(artifact)), 'utf8'),
        );
        if (route === '/') {
          for (const link of [
            '/llms.txt',
            '/sitemap.xml',
            '/sitemap.md',
            '/.well-known/api-catalog',
          ]) {
            assert.ok(html.headers.get('Link').includes(`<${link}>`));
            assert.ok(markdown.headers.get('Link').includes(`<${link}>`));
          }
        }
        const preferredHtml = await request(route, 'text/html, text/markdown;q=0.5');
        documentHeaders(preferredHtml, 'text/html');
        await preferredHtml.arrayBuffer();
        for (const accept of ['text/html', 'text/markdown']) {
          const head = await request(route, accept, 'HEAD');
          assert.equal(head.status, 200);
          documentHeaders(head, accept);
          assert.equal(await head.text(), '');
        }
      });
    }

    await t.test(
      'an existing document falls back to HTML when its Markdown artifact is absent',
      async () => {
        const artifact = `${routes[2]}/index.md`;
        const filename = path.join(dist, decodeURIComponent(artifact));
        const backup = `${filename}.smoke-backup`;
        await rename(filename, backup);
        try {
          const deadline = Date.now() + 10_000;
          let absent = false;
          while (Date.now() < deadline && !absent) {
            const response = await request(artifact);
            absent = response.status === 404;
            await response.arrayBuffer();
            if (!absent) await delay(100);
          }
          assert.ok(absent, 'the local assets watcher did not observe the removed artifact');
          const response = await request(routes[2], 'text/markdown');
          assert.equal(response.status, 200);
          documentHeaders(response, 'text/html');
          assert.ok(response.headers.get('Link').includes(`<${artifact}>; rel="alternate"`));
          assert.match(await response.text(), /<!doctype html>/i);
        } finally {
          await rename(backup, filename);
        }
      },
    );

    await t.test(
      'generated redirects, asset passthrough, and missing Markdown fallback',
      async () => {
        for (const [from, to] of [
          ['/1', '/'],
          ['/notes', '/notes/'],
          [routes[1] + '/', routes[1]],
        ]) {
          const response = await request(from, 'text/markdown');
          assert.equal(response.status, 301);
          assert.equal(new URL(response.headers.get('Location'), origin).pathname, to);
          await response.arrayBuffer();
        }
        const asset = await request('/llms.txt');
        assert.equal(asset.status, 200);
        assert.equal(await asset.text(), await readFile(path.join(dist, 'llms.txt'), 'utf8'));
        const missing = await request('/post/cf-smoke-missing-document', 'text/markdown');
        assert.equal(missing.status, 404);
        assert.equal(missing.headers.get('Content-Language'), 'ja');
        assert.ok(missing.headers.get('Vary').includes('Accept'));
        assert.ok(missing.headers.get('Link').includes('rel="alternate"'));
        assert.doesNotMatch(missing.headers.get('Content-Type') ?? '', /^text\/markdown/);
        await missing.arrayBuffer();
      },
    );
  },
);
