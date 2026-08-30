function getMarkdownArtifactPath(pathname) {
  if (pathname === '/') return '/index.md';

  const match = pathname.match(/^\/(post|notes)\/([^/]+)$/);
  return match ? `/${match[1]}/${match[2]}/index.md` : null;
}

function parseQuality(value) {
  if (!/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value)) return null;
  return Number(value);
}

function splitOutsideQuotes(value, delimiter) {
  const parts = [];
  let start = 0;
  let inQuotes = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inQuotes && character === '\\') {
      escaped = true;
      continue;
    }
    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && character === delimiter) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }

  if (inQuotes || escaped) return null;
  parts.push(value.slice(start));
  return parts;
}

function normalizeParameterValue(value) {
  if (!value.startsWith('"') || !value.endsWith('"')) return value.toLowerCase();

  let normalized = '';
  let escaped = false;
  for (const character of value.slice(1, -1)) {
    if (escaped) {
      normalized += character;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else {
      normalized += character;
    }
  }

  return normalized.toLowerCase();
}

function parseAccept(accept) {
  if (!accept) return [];

  const items = splitOutsideQuotes(accept, ',');
  if (!items) return [];

  return items.flatMap((item, index) => {
    const parts = splitOutsideQuotes(item, ';')?.map((part) => part.trim());
    if (!parts) return [];
    const mediaType = parts.shift()?.toLowerCase();
    if (!mediaType) return [];

    const [type, subtype, ...extra] = mediaType.split('/');
    if (
      extra.length > 0 ||
      !type ||
      !subtype ||
      (type === '*' && subtype !== '*') ||
      (type.includes('*') && type !== '*') ||
      (subtype.includes('*') && subtype !== '*')
    ) {
      return [];
    }

    let quality = 1;
    let hasQuality = false;
    const parameters = [];
    for (const parameter of parts) {
      const separator = parameter.indexOf('=');
      if (separator < 1) return [];

      const name = parameter.slice(0, separator).trim().toLowerCase();
      const value = parameter.slice(separator + 1).trim();
      if (name !== 'q') {
        if (!hasQuality) parameters.push({ name, value: normalizeParameterValue(value) });
        continue;
      }
      if (hasQuality) return [];

      quality = parseQuality(value);
      if (quality === null) return [];
      hasQuality = true;
    }

    return [{ type, subtype, quality, parameters, index }];
  });
}

const OFFERED_MEDIA_PARAMETERS = new Map([['charset', 'utf-8']]);

function qualityFor(ranges, type, subtype, explicitOnly = false) {
  const matching = ranges.filter((range) => {
    const isMatch =
      (range.type === '*' || range.type === type) &&
      (range.subtype === '*' || range.subtype === subtype) &&
      range.parameters.every(({ name, value }) => OFFERED_MEDIA_PARAMETERS.get(name) === value);
    return isMatch && (!explicitOnly || (range.type === type && range.subtype === subtype));
  });

  matching.sort((left, right) => {
    const leftSpecificity = (left.type === '*' ? 0 : 1) + (left.subtype === '*' ? 0 : 1);
    const rightSpecificity = (right.type === '*' ? 0 : 1) + (right.subtype === '*' ? 0 : 1);
    return (
      rightSpecificity - leftSpecificity ||
      right.parameters.length - left.parameters.length ||
      left.index - right.index
    );
  });

  return matching[0]?.quality ?? 0;
}

function shouldServeMarkdown(accept) {
  const ranges = parseAccept(accept);
  const markdownQuality = qualityFor(ranges, 'text', 'markdown', true);
  if (markdownQuality <= 0) return false;

  return markdownQuality > qualityFor(ranges, 'text', 'html');
}

function appendVary(headers, value) {
  const current = headers.get('Vary');
  const values = current ? current.split(',').map((item) => item.trim()) : [];
  if (values.includes('*')) return;
  if (values.some((item) => item.toLowerCase() === value.toLowerCase())) return;

  headers.set('Vary', current ? `${current}, ${value}` : value);
}

const HOMEPAGE_DISCOVERY_LINKS = [
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</sitemap.xml>; rel="describedby"; type="application/xml"',
  '</sitemap.md>; rel="describedby"; type="text/markdown"',
  '</.well-known/api-catalog>; rel="api-catalog"',
];

function appendLinks(headers, links) {
  if (links.length === 0) return;

  const current = headers.get('Link');
  const parsed = current ? splitOutsideQuotes(current, ',') : [];
  if (parsed === null) {
    for (const link of links) {
      if (!current.includes(link)) headers.append('Link', link);
    }
    return;
  }

  const existing = parsed.map((item) => item.trim()).filter(Boolean);
  const unique = [];

  for (const link of [...existing, ...links]) {
    if (!unique.includes(link)) unique.push(link);
  }

  headers.set('Link', unique.join(', '));
}

function getMediaType(contentType) {
  return contentType?.split(';', 1)[0]?.trim().toLowerCase() ?? '';
}

function isLanguageBearingDocument(contentType) {
  return ['text/html', 'text/markdown'].includes(getMediaType(contentType));
}

function rewriteResponse(
  response,
  { method, contentType, knownJapaneseDocument = false, varyByAccept = false, links = [] } = {},
) {
  const headers = new Headers(response.headers);
  if (varyByAccept) appendVary(headers, 'Accept');
  if (contentType) headers.set('Content-Type', contentType);
  if (knownJapaneseDocument || isLanguageBearingDocument(headers.get('Content-Type'))) {
    headers.set('Content-Language', 'ja');
  }
  appendLinks(headers, links);

  return new Response(method === 'HEAD' ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const artifactPath = getMarkdownArtifactPath(url.pathname);
    const eligible =
      (request.method === 'GET' || request.method === 'HEAD') && Boolean(artifactPath);

    if (!eligible) {
      const response = await env.ASSETS.fetch(request);
      return rewriteResponse(response, { method: request.method });
    }

    const homepageLinks = url.pathname === '/' ? HOMEPAGE_DISCOVERY_LINKS : [];
    const htmlLinks = [
      `<${artifactPath}>; rel="alternate"; type="text/markdown"`,
      ...homepageLinks,
    ];

    if (shouldServeMarkdown(request.headers.get('Accept'))) {
      const artifactUrl = new URL(request.url);
      artifactUrl.pathname = artifactPath;
      const markdownResponse = await env.ASSETS.fetch(new Request(artifactUrl, request));
      if (markdownResponse.ok || markdownResponse.status === 304) {
        return rewriteResponse(markdownResponse, {
          method: request.method,
          contentType: 'text/markdown; charset=utf-8',
          knownJapaneseDocument: true,
          varyByAccept: true,
          links: homepageLinks,
        });
      }
    }

    const htmlResponse = await env.ASSETS.fetch(request);
    return rewriteResponse(htmlResponse, {
      method: request.method,
      knownJapaneseDocument: true,
      varyByAccept: true,
      links: htmlLinks,
    });
  },
};

export default worker;
