import assert from 'node:assert/strict';
import { test } from 'node:test';

import worker from './index.mjs';

function createAssets(files) {
  const calls = [];

  return {
    calls,
    fetch(input) {
      const request = input instanceof Request ? input : new Request(input);
      const pathname = new URL(request.url).pathname;
      calls.push({ method: request.method, pathname });

      const file = files[pathname];
      if (!file) {
        return Promise.resolve(new Response('Not found', { status: 404 }));
      }

      return Promise.resolve(
        new Response(request.method === 'HEAD' ? null : file.body, {
          status: file.status ?? 200,
          headers: file.headers,
        }),
      );
    },
  };
}

test('GET / with explicit Markdown Accept serves the homepage artifact', async () => {
  const assets = createAssets({
    '/': {
      body: '<html>home</html>',
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    },
    '/index.md': {
      body: '# Home\n',
      headers: { ETag: '"markdown"' },
    },
  });

  const response = await worker.fetch(
    new Request('https://example.test/', {
      headers: { Accept: 'text/markdown' },
    }),
    { ASSETS: assets },
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), '# Home\n');
  assert.deepEqual(assets.calls, [{ method: 'GET', pathname: '/index.md' }]);
});

test('canonical slashless article and note routes map to their Markdown artifacts', async () => {
  for (const [pathname, artifactPath, body] of [
    ['/post/hello', '/post/hello/index.md', '# Article\n'],
    ['/notes/quick-note', '/notes/quick-note/index.md', '# Note\n'],
  ]) {
    const assets = createAssets({
      [pathname]: { body: '<html>fallback</html>' },
      [artifactPath]: { body },
    });

    const response = await worker.fetch(
      new Request(`https://example.test${pathname}`, {
        headers: { Accept: 'text/markdown' },
      }),
      { ASSETS: assets },
    );

    assert.equal(await response.text(), body, pathname);
    assert.deepEqual(assets.calls, [{ method: 'GET', pathname: artifactPath }], pathname);
  }
});

test('trailing-slash article and note redirects bypass Markdown negotiation', async () => {
  for (const pathname of ['/post/about/', '/notes/quick-note/']) {
    const canonicalPath = pathname.slice(0, -1);
    const artifactPath = `${canonicalPath}/index.md`;
    const assets = createAssets({
      [pathname]: {
        status: 301,
        headers: { Location: canonicalPath },
      },
      [artifactPath]: { body: '# Markdown sidecar\n' },
    });

    const response = await worker.fetch(
      new Request(`https://example.test${pathname}`, {
        headers: { Accept: 'text/markdown' },
      }),
      { ASSETS: assets },
    );

    assert.equal(response.status, 301, pathname);
    assert.equal(response.headers.get('Location'), canonicalPath, pathname);
    assert.equal(response.headers.get('Vary'), null, pathname);
    assert.deepEqual(assets.calls, [{ method: 'GET', pathname }], pathname);
  }
});

test('Markdown is selected only when its explicit quality beats HTML', async () => {
  for (const [accept, expectedBody] of [
    ['text/markdown;q=1, text/html;q=0.8', '# Markdown\n'],
    ['text/markdown, text/html', '<html>home</html>'],
  ]) {
    const assets = createAssets({
      '/': { body: '<html>home</html>' },
      '/index.md': { body: '# Markdown\n' },
    });

    const response = await worker.fetch(
      new Request('https://example.test/', { headers: { Accept: accept } }),
      { ASSETS: assets },
    );

    assert.equal(await response.text(), expectedBody, accept);
  }
});

test('Accept media-type parameters match the offered Markdown and HTML representations', async () => {
  for (const [accept, expectedBody] of [
    ['text/markdown; profile="v2";q=1, text/html;q=0.9', '<html>home</html>'],
    ['text/markdown; CHARSET="UTF-8";q=1, text/html;q=0.9', '# Markdown\n'],
    ['text/markdown; charset=utf-16;q=1, text/html;q=0.9', '<html>home</html>'],
    ['text/markdown;q=1; profile="v2", text/html;q=0.9', '# Markdown\n'],
    ['text/markdown;q=0.8, text/html; charset=utf-16;q=1', '# Markdown\n'],
    ['text/markdown;q=0.8, text/html; CHARSET="uTf-8";q=0.9', '<html>home</html>'],
    ['text/markdown;q=1; profile="v2\\"quoted", text/html;q=0.9', '# Markdown\n'],
    ['text/*; charset="UTF-8";q=0.9, text/markdown;q=0.8', '<html>home</html>'],
    ['text/*; charset=utf-16;q=1, text/markdown;q=0.8', '# Markdown\n'],
    ['*/*; charset="UTF-8";q=0.9, text/markdown;q=0.8', '<html>home</html>'],
    ['*/*; charset=utf-16;q=1, text/markdown;q=0.8', '# Markdown\n'],
  ]) {
    const assets = createAssets({
      '/': { body: '<html>home</html>' },
      '/index.md': { body: '# Markdown\n' },
    });

    const response = await worker.fetch(
      new Request('https://example.test/', { headers: { Accept: accept } }),
      { ASSETS: assets },
    );

    assert.equal(await response.text(), expectedBody, accept);
  }
});

test('matching media parameters refine Accept specificity before source order', async () => {
  for (const accept of [
    'text/html;q=0.5, text/html;charset=utf-8;q=0.9, text/markdown;q=0.8',
    'text/html;charset=utf-8;q=0.9, text/html;q=0.5, text/markdown;q=0.8',
  ]) {
    const assets = createAssets({
      '/': { body: '<html>home</html>' },
      '/index.md': { body: '# Markdown\n' },
    });

    const response = await worker.fetch(
      new Request('https://example.test/', { headers: { Accept: accept } }),
      { ASSETS: assets },
    );

    assert.equal(await response.text(), '<html>home</html>', accept);
    assert.deepEqual(assets.calls, [{ method: 'GET', pathname: '/' }], accept);
  }
});

test('negotiated Markdown preserves asset metadata and sets its representation headers', async () => {
  const assets = createAssets({
    '/': { body: '<html>home</html>' },
    '/index.md': {
      body: '# Markdown\n',
      status: 203,
      headers: {
        'Content-Type': 'application/octet-stream',
        ETag: '"markdown"',
        'Cache-Control': 'public, max-age=60',
        Vary: 'Origin, Accept-Encoding',
      },
    },
  });

  const response = await worker.fetch(
    new Request('https://example.test/', {
      headers: { Accept: 'text/markdown' },
    }),
    { ASSETS: assets },
  );

  assert.equal(response.status, 203);
  assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(response.headers.get('ETag'), '"markdown"');
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=60');
  assert.equal(response.headers.get('Vary'), 'Origin, Accept-Encoding, Accept');
  assert.equal(await response.text(), '# Markdown\n');
});

test('eligible HTML responses append, deduplicate, and preserve Vary values', async () => {
  for (const [vary, expectedVary] of [
    [undefined, 'Accept'],
    ['Origin, Accept-Encoding', 'Origin, Accept-Encoding, Accept'],
    ['Origin, accept', 'Origin, accept'],
    ['*', '*'],
    ['Origin, *', 'Origin, *'],
  ]) {
    const assets = createAssets({
      '/': {
        body: '<html>home</html>',
        headers: {
          ETag: '"html"',
          ...(vary ? { Vary: vary } : {}),
        },
      },
      '/index.md': { body: '# Markdown\n' },
    });

    const response = await worker.fetch(
      new Request('https://example.test/', { headers: { Accept: 'text/html' } }),
      { ASSETS: assets },
    );

    assert.equal(await response.text(), '<html>home</html>', vary);
    assert.equal(response.headers.get('ETag'), '"html"', vary);
    assert.equal(response.headers.get('Vary'), expectedVary, vary);
    assert.deepEqual(assets.calls, [{ method: 'GET', pathname: '/' }], vary);
  }
});

test('an unavailable Markdown artifact falls back to the original HTML response', async () => {
  const assets = createAssets({
    '/post/missing': {
      body: '<html>article</html>',
      status: 206,
      headers: {
        ETag: '"html"',
        'Cache-Control': 'public, max-age=120',
      },
    },
  });

  const response = await worker.fetch(
    new Request('https://example.test/post/missing', {
      headers: { Accept: 'text/markdown' },
    }),
    { ASSETS: assets },
  );

  assert.equal(response.status, 206);
  assert.equal(await response.text(), '<html>article</html>');
  assert.equal(response.headers.get('ETag'), '"html"');
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=120');
  assert.equal(response.headers.get('Vary'), 'Accept');
  assert.deepEqual(assets.calls, [
    { method: 'GET', pathname: '/post/missing/index.md' },
    { method: 'GET', pathname: '/post/missing' },
  ]);
});

test('noncanonical paths and non-GET/HEAD methods bypass negotiation unchanged', async () => {
  for (const [method, pathname, body, status] of [
    ['POST', '/', '<html>post</html>', 405],
    ['GET', '/post', '<html>post archive</html>', 200],
    ['GET', '/post/one/two', '<html>nested</html>', 200],
    ['GET', '/category/software', '<html>category</html>', 200],
    ['GET', '/notes', '<html>notes archive</html>', 200],
    ['PUT', '/notes/one', '<html>put</html>', 405],
  ]) {
    const assets = createAssets({
      [pathname]: {
        body,
        status,
        headers: { ETag: '"unchanged"', Vary: 'Origin' },
      },
    });

    const response = await worker.fetch(
      new Request(`https://example.test${pathname}`, {
        method,
        headers: { Accept: 'text/markdown' },
      }),
      { ASSETS: assets },
    );

    assert.equal(response.status, status, `${method} ${pathname}`);
    assert.equal(await response.text(), body, `${method} ${pathname}`);
    assert.equal(response.headers.get('ETag'), '"unchanged"', `${method} ${pathname}`);
    assert.equal(response.headers.get('Vary'), 'Origin', `${method} ${pathname}`);
    assert.deepEqual(assets.calls, [{ method, pathname }], `${method} ${pathname}`);
  }
});

test('HEAD uses the negotiated Markdown status and headers without a body', async () => {
  const files = {
    '/post/head-test/index.md': {
      body: '# Head test\n',
      status: 206,
      headers: {
        'Content-Type': 'text/plain',
        ETag: '"head-test"',
        'Cache-Control': 'public, max-age=60',
        Vary: 'Origin',
      },
    },
  };

  const getResponse = await worker.fetch(
    new Request('https://example.test/post/head-test', {
      headers: { Accept: 'text/markdown' },
    }),
    { ASSETS: createAssets(files) },
  );
  const headAssets = createAssets(files);
  const headResponse = await worker.fetch(
    new Request('https://example.test/post/head-test', {
      method: 'HEAD',
      headers: { Accept: 'text/markdown' },
    }),
    { ASSETS: headAssets },
  );

  assert.equal(await getResponse.text(), '# Head test\n');
  assert.equal(headResponse.status, getResponse.status);
  assert.deepEqual([...headResponse.headers], [...getResponse.headers]);
  assert.equal(headResponse.body, null);
  assert.equal(await headResponse.text(), '');
  assert.deepEqual(headAssets.calls, [{ method: 'HEAD', pathname: '/post/head-test/index.md' }]);
});

test('Accept quality and specificity decide Markdown without wildcard opt-in', async () => {
  for (const [accept, expectedBody] of [
    [undefined, '<html>home</html>'],
    ['*/*', '<html>home</html>'],
    ['text/markdown;q=0', '<html>home</html>'],
    ['text/markdown;q=1.5', '<html>home</html>'],
    ['text/markdown;q=wat', '<html>home</html>'],
    ['text/*;q=1', '<html>home</html>'],
    ['text/*;q=1, text/markdown;q=0.5', '<html>home</html>'],
    ['text/*;q=0, text/markdown;q=0.5', '# Markdown\n'],
    ['*/*;q=0.1, text/markdown;q=0.2', '# Markdown\n'],
    ['*/*;q=0.9, text/markdown;q=0.8', '<html>home</html>'],
  ]) {
    const assets = createAssets({
      '/': { body: '<html>home</html>' },
      '/index.md': { body: '# Markdown\n' },
    });
    const requestInit = accept === undefined ? {} : { headers: { Accept: accept } };

    const response = await worker.fetch(new Request('https://example.test/', requestInit), {
      ASSETS: assets,
    });

    assert.equal(await response.text(), expectedBody, accept ?? 'missing Accept');
    assert.equal(response.headers.get('Vary'), 'Accept', accept ?? 'missing Accept');
    assert.deepEqual(
      assets.calls,
      [{ method: 'GET', pathname: expectedBody.startsWith('#') ? '/index.md' : '/' }],
      accept ?? 'missing Accept',
    );
  }
});

test('quoted Accept parameters stay within media ranges and malformed headers fall back safely', async () => {
  for (const [accept, expectedBody] of [
    ['text/html;profile="a;b";q=0.9, text/markdown;q=0.8', '# Markdown\n'],
    ['text/html;profile="a,b";q=0.9, text/markdown;q=0.8', '# Markdown\n'],
    ['text/html;profile="unterminated, text/markdown;q=0.8', '<html>home</html>'],
  ]) {
    const assets = createAssets({
      '/': { body: '<html>home</html>' },
      '/index.md': { body: '# Markdown\n' },
    });

    const response = await worker.fetch(
      new Request('https://example.test/', { headers: { Accept: accept } }),
      { ASSETS: assets },
    );

    assert.equal(await response.text(), expectedBody, accept);
    assert.deepEqual(
      assets.calls,
      [{ method: 'GET', pathname: expectedBody.startsWith('#') ? '/index.md' : '/' }],
      accept,
    );
  }
});
