const MARKDOWN_MEDIA_TYPE = 'text/markdown';

function parseQualityParameter(parameters) {
  const qualityParameter = parameters.find((parameter) => /^\s*q\s*=/i.test(parameter));
  if (!qualityParameter) {
    return 1;
  }

  const rawValue = qualityParameter.slice(qualityParameter.indexOf('=') + 1).trim();
  const value = rawValue.replace(/^"|"$/g, '');
  const quality = Number(value);
  return Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : 0;
}

export function acceptsMarkdown(accept) {
  if (typeof accept !== 'string' || accept.trim() === '') {
    return false;
  }

  return accept.split(',').some((item) => {
    const [mediaType, ...parameters] = item.split(';');
    if (mediaType.trim().toLowerCase() !== MARKDOWN_MEDIA_TYPE) {
      return false;
    }

    return parseQualityParameter(parameters) > 0;
  });
}

export function getMarkdownAssetPath(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) {
    return null;
  }

  if (pathname === '/') {
    return '/index.md';
  }

  if (pathname.endsWith('/index.html')) {
    return `${pathname.slice(0, -'index.html'.length)}index.md`;
  }

  if (pathname.endsWith('/')) {
    return `${pathname}index.md`;
  }

  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (lastSegment.includes('.')) {
    return null;
  }

  return `${pathname}/index.md`;
}

export function addAcceptToVary(headers) {
  const varyValues = (headers.get('Vary') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!varyValues.some((value) => value.toLowerCase() === 'accept')) {
    varyValues.push('Accept');
  }

  headers.set('Vary', varyValues.join(', '));
  return headers;
}

export function isHtmlResponse(response) {
  return (
    response.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase() === 'text/html'
  );
}
