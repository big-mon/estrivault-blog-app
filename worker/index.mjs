import {
  acceptsMarkdown,
  addAcceptToVary,
  getMarkdownAssetPath,
  isHtmlResponse,
} from './markdown-negotiation.mjs';

const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';

function createAssetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, {
    method: request.method,
    headers: request.headers,
  });
}

function copyResponse(response, { contentType, varyByAccept = false, method } = {}) {
  const headers = new Headers(response.headers);
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  if (varyByAccept) {
    addAcceptToVary(headers);
  }

  return new Response(method === 'HEAD' ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function fetchMarkdownSidecar(request, env) {
  const sidecarPath = getMarkdownAssetPath(new URL(request.url).pathname);
  if (!sidecarPath) {
    return null;
  }

  const response = await env.ASSETS.fetch(createAssetRequest(request, sidecarPath));
  if (!response.ok) {
    return null;
  }

  return copyResponse(response, {
    contentType: MARKDOWN_CONTENT_TYPE,
    method: request.method,
    varyByAccept: true,
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return env.ASSETS.fetch(request);
    }

    const response = await env.ASSETS.fetch(request);
    if (!response.ok || !isHtmlResponse(response)) {
      return response;
    }

    if (acceptsMarkdown(request.headers.get('Accept'))) {
      const markdownResponse = await fetchMarkdownSidecar(request, env);
      if (markdownResponse) {
        return markdownResponse;
      }
    }

    return copyResponse(response, { method: request.method, varyByAccept: true });
  },
};
