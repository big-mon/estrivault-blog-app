import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.mjs';

function createAssets(files) {
  return {
    fetch: async (request) => {
      const pathname = new URL(request.url).pathname;
      const file = files[pathname] ?? files[`${pathname.replace(/\/$/, '') || ''}/index.html`];
      if (!file) {
        return new Response('Not found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      const status = file.status ?? 200;
      const body = request.method === 'HEAD' || status === 304 ? null : file.body;
      return new Response(body, {
        status,
        headers: file.headers,
      });
    },
  };
}

function createRequest(pathname, { method = 'GET', accept, ifNoneMatch } = {}) {
  const headers = new Headers();
  if (accept !== undefined) {
    headers.set('Accept', accept);
  }
  if (ifNoneMatch !== undefined) {
    headers.set('If-None-Match', ifNoneMatch);
  }
  return new Request(`https://example.test${pathname}`, { method, headers });
}

const htmlHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=60',
};

test('preserves a conditional 304 Markdown sidecar response', async () => {
  const env = {
    ASSETS: createAssets({
      '/post/about/index.html': { body: '<main><h1>About</h1></main>', headers: htmlHeaders },
      '/post/about/index.md': {
        status: 304,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=120',
          ETag: '"markdown-version"',
          'Last-Modified': 'Sat, 01 Aug 2026 00:00:00 GMT',
        },
      },
    }),
  };

  const response = await worker.fetch(
    createRequest('/post/about', {
      accept: 'text/markdown',
      ifNoneMatch: '"markdown-version"',
    }),
    env,
  );

  assert.equal(response.status, 304);
  assert.equal(await response.text(), '');
  assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(response.headers.get('Vary'), 'Accept');
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=120');
  assert.equal(response.headers.get('ETag'), '"markdown-version"');
  assert.equal(response.headers.get('Last-Modified'), 'Sat, 01 Aug 2026 00:00:00 GMT');
});

test('serves a GET or HEAD Markdown sidecar for an explicitly accepted HTML page', async () => {
  const env = {
    ASSETS: createAssets({
      '/post/about/index.html': { body: '<main><h1>About</h1></main>', headers: htmlHeaders },
      '/post/about/index.md': {
        body: '# About\n',
        status: 206,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=120',
          ETag: '"markdown-version"',
        },
      },
    }),
  };

  const getResponse = await worker.fetch(
    createRequest('/post/about', { accept: 'text/html, text/markdown;q=0.8' }),
    env,
  );
  assert.equal(getResponse.status, 206);
  assert.equal(await getResponse.text(), '# About\n');
  assert.equal(getResponse.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(getResponse.headers.get('Vary'), 'Accept');
  assert.equal(getResponse.headers.get('Cache-Control'), 'public, max-age=120');
  assert.equal(getResponse.headers.get('ETag'), '"markdown-version"');

  const headResponse = await worker.fetch(
    createRequest('/post/about', { method: 'HEAD', accept: 'text/markdown' }),
    env,
  );
  assert.equal(headResponse.status, 206);
  assert.equal(await headResponse.text(), '');
  assert.equal(headResponse.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(headResponse.headers.get('Vary'), 'Accept');
  assert.equal(headResponse.headers.get('Cache-Control'), 'public, max-age=120');
});

test('keeps HEAD responses bodyless even if the asset binding returns a body', async () => {
  const env = {
    ASSETS: {
      fetch: async (request) => {
        const pathname = new URL(request.url).pathname;
        const body = pathname.endsWith('.md') ? '# About\n' : '<main><h1>About</h1></main>';
        return new Response(body, {
          status: pathname.endsWith('.md') ? 206 : 200,
          headers:
            pathname.endsWith('.md') ?
              { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=120' }
            : htmlHeaders,
        });
      },
    },
  };

  const markdownResponse = await worker.fetch(
    createRequest('/post/about', { method: 'HEAD', accept: 'text/markdown' }),
    env,
  );
  assert.equal(markdownResponse.status, 206);
  assert.equal(await markdownResponse.text(), '');
  assert.equal(markdownResponse.headers.get('Cache-Control'), 'public, max-age=120');

  const htmlResponse = await worker.fetch(
    createRequest('/post/about', { method: 'HEAD', accept: 'text/html' }),
    env,
  );
  assert.equal(htmlResponse.status, 200);
  assert.equal(await htmlResponse.text(), '');
  assert.equal(htmlResponse.headers.get('Vary'), 'Accept');
});

test('falls back to HTML and varies HTML responses by Accept', async () => {
  const env = {
    ASSETS: createAssets({
      '/post/about/index.html': { body: '<main><h1>About</h1></main>', headers: htmlHeaders },
      '/post/about/index.md': { body: '# About\n', headers: { 'Content-Type': 'text/markdown' } },
      '/post/missing/index.html': {
        body: '<main><h1>Missing sidecar</h1></main>',
        headers: { ...htmlHeaders, Vary: 'Origin' },
      },
    }),
  };

  const browserResponse = await worker.fetch(
    createRequest('/post/about', {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8',
    }),
    env,
  );
  assert.equal(await browserResponse.text(), '<main><h1>About</h1></main>');
  assert.equal(browserResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
  assert.equal(browserResponse.headers.get('Vary'), 'Accept');

  const qZeroResponse = await worker.fetch(
    createRequest('/post/about', { accept: 'text/markdown;q=0, text/html;q=1' }),
    env,
  );
  assert.equal(qZeroResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
  assert.equal(qZeroResponse.headers.get('Vary'), 'Accept');

  const missingSidecarResponse = await worker.fetch(
    createRequest('/post/missing', { accept: 'text/markdown' }),
    env,
  );
  assert.equal(missingSidecarResponse.status, 200);
  assert.equal(await missingSidecarResponse.text(), '<main><h1>Missing sidecar</h1></main>');
  assert.equal(missingSidecarResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
  assert.equal(missingSidecarResponse.headers.get('Vary'), 'Origin, Accept');
});

test('leaves non-HTML assets, existing Markdown endpoints, missing pages, and unsupported methods alone', async () => {
  const env = {
    ASSETS: createAssets({
      '/assets/site.css': {
        body: 'body { color: black; }',
        headers: { 'Content-Type': 'text/css; charset=utf-8' },
      },
      '/sitemap.md': {
        body: '# Sitemap\n',
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      },
      '/post/about/index.html': { body: '<main><h1>About</h1></main>', headers: htmlHeaders },
    }),
  };

  const assetResponse = await worker.fetch(
    createRequest('/assets/site.css', { accept: 'text/markdown' }),
    env,
  );
  assert.equal(assetResponse.status, 200);
  assert.equal(await assetResponse.text(), 'body { color: black; }');
  assert.equal(assetResponse.headers.get('Content-Type'), 'text/css; charset=utf-8');
  assert.equal(assetResponse.headers.get('Vary'), null);

  const endpointResponse = await worker.fetch(
    createRequest('/sitemap.md', { accept: 'text/markdown' }),
    env,
  );
  assert.equal(endpointResponse.status, 200);
  assert.equal(await endpointResponse.text(), '# Sitemap\n');
  assert.equal(endpointResponse.headers.get('Vary'), null);

  const missingResponse = await worker.fetch(
    createRequest('/post/does-not-exist', { accept: 'text/markdown' }),
    env,
  );
  assert.equal(missingResponse.status, 404);
  assert.equal(missingResponse.headers.get('Vary'), null);

  const postResponse = await worker.fetch(
    createRequest('/post/about', { method: 'POST', accept: 'text/markdown' }),
    env,
  );
  assert.equal(postResponse.status, 200);
  assert.equal(await postResponse.text(), '<main><h1>About</h1></main>');
  assert.equal(postResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
  assert.equal(postResponse.headers.get('Vary'), null);
});

test('does not negotiate sidecars for non-documents, redirects, or missing pages', async () => {
  const env = {
    ASSETS: createAssets({
      '/assets/download': {
        body: 'binary payload',
        headers: { 'Content-Type': 'application/octet-stream', ETag: '"asset"' },
      },
      '/assets/download/index.md': {
        body: '# Not an asset\n',
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      },
      '/post/about/': {
        body: 'Moved',
        status: 301,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          Location: '/post/about',
          Vary: 'Origin',
        },
      },
      '/post/about/index.md': {
        body: '# About\n',
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      },
      '/post/missing/index.md': {
        body: '# Missing\n',
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      },
    }),
  };

  const assetResponse = await worker.fetch(
    createRequest('/assets/download', { accept: 'text/markdown' }),
    env,
  );
  assert.equal(assetResponse.status, 200);
  assert.equal(await assetResponse.text(), 'binary payload');
  assert.equal(assetResponse.headers.get('Content-Type'), 'application/octet-stream');
  assert.equal(assetResponse.headers.get('Vary'), null);

  const redirectResponse = await worker.fetch(
    createRequest('/post/about/', { accept: 'text/markdown' }),
    env,
  );
  assert.equal(redirectResponse.status, 301);
  assert.equal(await redirectResponse.text(), 'Moved');
  assert.equal(redirectResponse.headers.get('Location'), '/post/about');
  assert.equal(redirectResponse.headers.get('Vary'), 'Origin');

  const missingResponse = await worker.fetch(
    createRequest('/post/missing', { accept: 'text/markdown' }),
    env,
  );
  assert.equal(missingResponse.status, 404);
  assert.equal(await missingResponse.text(), 'Not found');
  assert.equal(missingResponse.headers.get('Vary'), null);
});
