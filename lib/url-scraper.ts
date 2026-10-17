import dns from 'dns';

export class ScraperError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ScraperError';
  }
}

/**
 * Checks if an IPv4 or IPv6 string falls into private, loopback, link-local, or reserved ranges.
 */
export function isPrivateIP(ip: string): boolean {
  // Normalize IPv6-mapped IPv4
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // IPv4 check
  if (ip.includes('.')) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true; // invalid IP, block for safety
    }
    const [a, b] = parts;
    if (a === 0) return true; // Current network
    if (a === 10) return true; // Private RFC 1918
    if (a === 127) return true; // Loopback
    if (a === 169 && b === 254) return true; // Link-local & cloud metadata (169.254.169.254)
    if (a === 172 && b >= 16 && b <= 31) return true; // Private RFC 1918
    if (a === 192 && b === 168) return true; // Private RFC 1918
    if (a === 100 && b >= 64 && b <= 127) return true; // Carrier-grade NAT
    if (a === 192 && b === 0) return true; // IETF Protocol Assignments
    if (a === 198 && (b === 18 || b === 19)) return true; // Benchmarking
    if (a >= 224) return true; // Multicast & Reserved
    return false;
  }

  // IPv6 check
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::' || lower === '0:0:0:0:0:0:0:1') return true; // Loopback & unspecified
  if (lower.startsWith('fe80:') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true; // Link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // Unique local address
  return false;
}

/**
 * Validates a URL and ensures it does not resolve to an internal/private address (SSRF Protection).
 */
export async function validateSafePublicUrl(urlString: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new ScraperError('Invalid URL format.', 'INVALID_URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ScraperError('Only HTTP and HTTPS URLs are supported.', 'INVALID_PROTOCOL');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new ScraperError('Local and internal addresses cannot be analyzed.', 'BLOCKED_HOST');
  }

  // If hostname is directly an IP
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
    if (isPrivateIP(hostname)) {
      throw new ScraperError('Access to private/local network addresses is prohibited.', 'SSRF_BLOCKED');
    }
  }

  // Perform DNS resolution to check real destination IP
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIP(addr.address)) {
        throw new ScraperError(
          'Target hostname resolves to a restricted or private network address.',
          'SSRF_BLOCKED'
        );
      }
    }
  } catch (err: unknown) {
    if (err instanceof ScraperError) throw err;
    throw new ScraperError('Could not resolve hostname. Please verify the URL.', 'DNS_LOOKUP_FAILED');
  }

  return parsed;
}

/**
 * Safely fetches a public webpage URL with SSRF protection, timeout, and size limits.
 */
export async function scrapeWebpageContent(urlString: string): Promise<{ title: string; text: string; url: string }> {
  let currentUrl = urlString;
  let redirectsRemaining = 3;
  let response: Response | null = null;

  while (redirectsRemaining >= 0) {
    const validUrl = await validateSafePublicUrl(currentUrl);

    try {
      response = await fetch(validUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpportunityKit/1.0 (Public Bot)',
          Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        redirect: 'manual', // handle redirects manually to check SSRF on target
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('aborted') || msg.includes('timeout')) {
        throw new ScraperError('Request timed out while trying to reach the webpage (10s limit).', 'TIMEOUT');
      }
      throw new ScraperError(`Failed to connect to the webpage: ${msg}`, 'CONNECTION_FAILED');
    }

    // Check for redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        throw new ScraperError('Redirect response without Location header.', 'REDIRECT_ERROR');
      }
      currentUrl = new URL(location, currentUrl).toString();
      redirectsRemaining--;
      continue;
    }

    break;
  }

  if (!response || !response.ok) {
    const status = response ? response.status : 500;
    if (status === 401 || status === 403) {
      throw new ScraperError(
        'This webpage requires authentication, login, or has access restrictions. Please copy and paste the announcement text directly.',
        'ACCESS_DENIED'
      );
    }
    if (status === 404) {
      throw new ScraperError('The opportunity webpage was not found (404). Please verify the link.', 'NOT_FOUND');
    }
    throw new ScraperError(`Server returned HTTP ${status}. Try copying and pasting the announcement text.`, 'HTTP_ERROR');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
    throw new ScraperError(
      'The destination URL is not an HTML webpage or text document. Please paste the announcement text or upload a PDF.',
      'UNSUPPORTED_CONTENT_TYPE'
    );
  }

  // Enforce 1MB max response size
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
    throw new ScraperError('The webpage exceeds the 1 MB size limit.', 'FILE_TOO_LARGE');
  }

  const html = await response.text();
  const { title, text } = extractCleanTextFromHtml(html);

  if (text.length < 50) {
    throw new ScraperError(
      'Could not extract sufficient text from this webpage (often due to client-side JavaScript rendering). Please copy and paste the announcement text directly.',
      'EMPTY_CONTENT'
    );
  }

  return {
    title,
    text: text.slice(0, 30000),
    url: currentUrl,
  };
}

/**
 * Extracts readable text and title from HTML markup.
 */
export function extractCleanTextFromHtml(html: string): { title: string; text: string } {
  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : '';

  // Remove scripts, styles, noscript, svg, nav, footer, header
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // Convert line breaking tags to newlines
  clean = clean
    .replace(/<(?:p|div|h[1-6]|li|br|hr|tr)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  clean = clean
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&bull;/gi, '•')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–');

  // Normalize whitespace: collapse spaces per line, collapse 3+ newlines to 2
  const lines = clean
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l) => l.length > 0);

  const text = lines.join('\n');
  return { title: title.replace(/\s+/g, ' ').trim(), text };
}
