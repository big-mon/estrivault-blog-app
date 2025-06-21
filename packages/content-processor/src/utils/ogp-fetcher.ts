/**
 * OGP (Open Graph Protocol) metadata fetcher
 * Fetches and parses OGP metadata from web pages
 */

export interface OgpMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
}

// Simple in-memory cache for build-time optimization
const ogpCache = new Map<string, OgpMetadata | null>();

/**
 * Create fallback metadata when OGP fetch fails
 * @param url The URL to create fallback metadata for
 * @returns Basic metadata with domain and title
 */
function createFallbackMetadata(url: string): OgpMetadata {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    
    // Create a nice title from the domain
    const title = hostname
      .split('.')
      .slice(0, -1) // Remove TLD
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    
    return {
      title: title || hostname,
      url: url,
      siteName: hostname,
      description: `Visit ${hostname}`,
    };
  } catch (e) {
    return {
      title: 'Website',
      url: url,
      siteName: 'Unknown',
    };
  }
}

/**
 * HTML decode basic entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'");
}

/**
 * Extract OGP metadata from HTML content using improved regex
 * @param html HTML content
 * @returns Parsed OGP metadata
 */
function parseOgpFromHtml(html: string): OgpMetadata {
  const metadata: OgpMetadata = {};

  // より柔軟なOGP meta tag regex patterns (属性の順序や空白を考慮)
  const ogpPatterns = {
    title: /<meta\s+[^>]*property\s*=\s*["']og:title["'][^>]*content\s*=\s*["']([^"']*?)["']/i,
    description: /<meta\s+[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']*?)["']/i,
    image: /<meta\s+[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']*?)["']/i,
    url: /<meta\s+[^>]*property\s*=\s*["']og:url["'][^>]*content\s*=\s*["']([^"']*?)["']/i,
    siteName: /<meta\s+[^>]*property\s*=\s*["']og:site_name["'][^>]*content\s*=\s*["']([^"']*?)["']/i,
    type: /<meta\s+[^>]*property\s*=\s*["']og:type["'][^>]*content\s*=\s*["']([^"']*?)["']/i,
  };

  // Content-first patterns (より柔軟)
  const ogpPatternsReversed = {
    title: /<meta\s+[^>]*content\s*=\s*["']([^"']*?)["'][^>]*property\s*=\s*["']og:title["']/i,
    description: /<meta\s+[^>]*content\s*=\s*["']([^"']*?)["'][^>]*property\s*=\s*["']og:description["']/i,
    image: /<meta\s+[^>]*content\s*=\s*["']([^"']*?)["'][^>]*property\s*=\s*["']og:image["']/i,
    url: /<meta\s+[^>]*content\s*=\s*["']([^"']*?)["'][^>]*property\s*=\s*["']og:url["']/i,
    siteName: /<meta\s+[^>]*content\s*=\s*["']([^"']*?)["'][^>]*property\s*=\s*["']og:site_name["']/i,
    type: /<meta\s+[^>]*content\s*=\s*["']([^"']*?)["'][^>]*property\s*=\s*["']og:type["']/i,
  };

  // Fallback patterns for standard meta tags
  const fallbackPatterns = {
    title: /<title[^>]*>([^<]*?)<\/title>/i,
    description: /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*?)["']/i,
  };

  // Try OGP patterns first
  for (const [key, pattern] of Object.entries(ogpPatterns)) {
    const match = html.match(pattern);
    if (match?.[1]) {
      metadata[key as keyof OgpMetadata] = decodeHtmlEntities(match[1].trim());
    }
  }

  // Try reversed patterns if no match found
  for (const [key, pattern] of Object.entries(ogpPatternsReversed)) {
    if (!metadata[key as keyof OgpMetadata]) {
      const match = html.match(pattern);
      if (match?.[1]) {
        metadata[key as keyof OgpMetadata] = decodeHtmlEntities(match[1].trim());
      }
    }
  }

  // Use fallback patterns if OGP not found
  if (!metadata.title) {
    const titleMatch = html.match(fallbackPatterns.title);
    if (titleMatch && titleMatch[1]) {
      metadata.title = decodeHtmlEntities(titleMatch[1].trim());
    }
  }

  if (!metadata.description) {
    const descMatch = html.match(fallbackPatterns.description);
    if (descMatch && descMatch[1]) {
      metadata.description = decodeHtmlEntities(descMatch[1].trim());
    }
  }

  return metadata;
}

// 複数のUser-Agent戦略
const USER_AGENTS = [
  // 主要ブラウザ（最新）
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Safari
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  // モバイル
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  // ソーシャルメディアボット（よく許可される）
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Twitterbot/1.0',
  'LinkedInBot/1.0 (compatible; Mozilla/5.0; +https://www.linkedin.com/help/linkedin/answer/65521)',
];

/**
 * 単一の戦略でOGPを取得
 */
async function fetchWithStrategy(url: string, userAgent: string, additionalHeaders: Record<string, string> = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

  try {
    const baseHeaders: Record<string, string> = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      ...additionalHeaders,
    };

    // ソーシャルメディアボットの場合はよりシンプルなヘッダー
    if (userAgent.includes('bot') || userAgent.includes('Bot')) {
      return await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html',
        },
        signal: controller.signal,
      });
    }

    // 通常のブラウザの場合はリアルなヘッダー
    return await fetch(url, {
      method: 'GET',
      headers: baseHeaders,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch OGP metadata from a URL with multiple retry strategies
 * @param url URL to fetch metadata from
 * @returns Promise resolving to OGP metadata or null if failed
 */
export async function fetchOgpMetadata(url: string): Promise<OgpMetadata | null> {
  // Check cache first
  if (ogpCache.has(url)) {
    return ogpCache.get(url) || null;
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      ogpCache.set(url, null);
      return null;
    }

    let lastError: string = 'Unknown error';

    // 複数の戦略を順番に試行
    for (let i = 0; i < USER_AGENTS.length; i++) {
      const userAgent = USER_AGENTS[i];
      
      try {
        // 少し待機してレート制限を回避
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        }

        const response = await fetchWithStrategy(url, userAgent, {
          // ランダムな要素を追加してフィンガープリンティングを回避
          'Cache-Control': Math.random() > 0.5 ? 'no-cache' : 'max-age=0',
        });

        // 成功した場合の処理
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            const html = await response.text();
            const truncatedHtml = html.substring(0, 100000); // 100KBに増加
            const metadata = parseOgpFromHtml(truncatedHtml);

            // Resolve relative image URLs
            if (metadata.image && !metadata.image.startsWith('http')) {
              try {
                metadata.image = new URL(metadata.image, url).href;
              } catch (e) {
                metadata.image = undefined;
              }
            }

            if (!metadata.url) {
              metadata.url = url;
            }

            // ログ出力（成功時）
            if (process.env.NODE_ENV === 'development' || process.env.OGP_VERBOSE === 'true') {
              console.log(`✅ OGP fetched successfully for ${parsedUrl.hostname} (attempt ${i + 1}, ${userAgent.split(' ')[0]})`);
            }

            ogpCache.set(url, metadata);
            return metadata;
          } else {
            if (process.env.NODE_ENV === 'development' || process.env.OGP_VERBOSE === 'true') {
              console.log(`⚠️ Non-HTML content for ${parsedUrl.hostname}: ${contentType}`);
            }
          }
        } else if (response.status === 403 || response.status === 429) {
          // 403/429はリトライを継続
          lastError = `${response.status} ${response.statusText}`;
        } else {
          // その他のエラーは早期終了
          lastError = `${response.status} ${response.statusText}`;
          break;
        }
      } catch (error) {
        lastError = (error as Error).message;
        // タイムアウトやネットワークエラーは次の戦略を試行
      }
    }

    // すべての戦略が失敗した場合、フォールバックメタデータを作成
    if (process.env.NODE_ENV === 'development' || process.env.OGP_VERBOSE === 'true') {
      console.log(`❌ All strategies failed for ${parsedUrl.hostname}: ${lastError}`);
    }
    
    const fallbackMetadata = createFallbackMetadata(url);
    ogpCache.set(url, fallbackMetadata);
    return fallbackMetadata;
  } catch (error) {
    // Only log timeouts and unexpected errors in development or verbose mode
    if (process.env.NODE_ENV === 'development' || process.env.OGP_VERBOSE === 'true') {
      if ((error as Error).name === 'AbortError') {
        console.log(`OGP fetch timeout for ${new URL(url).hostname}, using fallback card`);
      } else {
        console.log(`OGP fetch error for ${new URL(url).hostname}: ${(error as Error).message}, using fallback card`);
      }
    }

    // Use fallback metadata instead of null for better user experience
    const fallbackMetadata = createFallbackMetadata(url);
    ogpCache.set(url, fallbackMetadata);
    return fallbackMetadata;
  }
}

/**
 * Check if a URL should be processed for OGP
 * @param url URL to check
 * @returns true if URL should be processed
 */
export function shouldFetchOgp(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only process HTTP/HTTPS URLs
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Skip GitHub URLs (handled by github-embed plugin)
    if (parsedUrl.hostname === 'github.com') {
      return false;
    }

    // Skip common file extensions
    const skipExts = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.mov', '.avi', '.zip', '.tar', '.gz'];
    const pathname = parsedUrl.pathname.toLowerCase();
    if (skipExts.some(ext => pathname.endsWith(ext))) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}