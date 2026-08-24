import {
  acceptsMarkdown,
  addAcceptToVary,
  getMarkdownAssetPath,
  isHtmlResponse,
} from './markdown-negotiation.mjs';

const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';
const REPRESENTATION_CONDITIONAL_HEADERS = [
  'If-Match',
  'If-None-Match',
  'If-Modified-Since',
  'If-Unmodified-Since',
  'If-Range',
  'Range',
];

function createAssetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, {
    method: request.method,
    headers: request.headers,
  });
}

function hasRepresentationConditionalHeaders(request) {
  return REPRESENTATION_CONDITIONAL_HEADERS.some((header) => request.headers.has(header));
}

function createHtmlEligibilityRequest(request) {
  const headers = new Headers(request.headers);
  for (const header of REPRESENTATION_CONDITIONAL_HEADERS) {
    headers.delete(header);
  }

  return new Request(request, { headers });
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
  if (
    !response.ok &&
    response.status !== 304 &&
    response.status !== 412 &&
    response.status !== 416
  ) {
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

    const markdownPath =
      acceptsMarkdown(request.headers.get('Accept')) ?
        getMarkdownAssetPath(new URL(request.url).pathname)
      : null;
    const shouldProbeWithoutConditionals =
      markdownPath !== null && hasRepresentationConditionalHeaders(request);
    const response = await env.ASSETS.fetch(
      shouldProbeWithoutConditionals ? createHtmlEligibilityRequest(request) : request,
    );
    if ((!response.ok && response.status !== 304) || !isHtmlResponse(response)) {
      if (shouldProbeWithoutConditionals) {
        return env.ASSETS.fetch(request);
      }

      return response;
    }

    if (markdownPath) {
      const markdownResponse = await fetchMarkdownSidecar(request, env);
      if (markdownResponse) {
        return markdownResponse;
      }

      if (shouldProbeWithoutConditionals) {
        return copyResponse(await env.ASSETS.fetch(request), {
          method: request.method,
          varyByAccept: true,
        });
      }
    }

    return copyResponse(response, { method: request.method, varyByAccept: true });
  },
};
