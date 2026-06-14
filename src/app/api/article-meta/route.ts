import { NextRequest, NextResponse } from "next/server";

// Social media & search bot headers - thử nhiều loại để bypass protection
const BOT_HEADERS_LIST: Record<string, string>[] = [
  // Googlebot Smartphone - rendering bot, thường được whitelist nhất
  {
    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  },
  // Twitterbot
  {
    "User-Agent": "Twitterbot/1.0",
    "Accept": "text/html,application/xhtml+xml",
  },
  // Facebook
  {
    "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  },
  // Slackbot
  {
    "User-Agent": "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Accept": "text/html,application/xhtml+xml",
  },
  // Browser fallback
  {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  },
];

interface ArticleMeta {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  readingTime: string | null;
  publisher: string | null;
}

/**
 * Parse meta tag content from HTML
 */
function parseMetaContent(html: string, property: string, isName = false): string | null {
  const attr = isName ? "name" : "property";
  // Try property/name first, then content
  const match = html.match(
    new RegExp(`<meta[^>]*${attr}=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i")
  ) || html.match(
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${property}["'][^>]*>`, "i")
  );
  return match?.[1] || null;
}

/**
 * Parse title from HTML with fallback chain
 */
function parseTitle(html: string): string | null {
  // 1. og:title
  const ogTitle = parseMetaContent(html, "og:title");
  if (ogTitle) return decodeHtmlEntities(ogTitle);
  
  // 2. twitter:title
  const twitterTitle = parseMetaContent(html, "twitter:title", true);
  if (twitterTitle) return decodeHtmlEntities(twitterTitle);
  
  // 3. <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) return decodeHtmlEntities(titleMatch[1].trim());
  
  // 4. First <h1>
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match?.[1]) return decodeHtmlEntities(h1Match[1].trim());
  
  return null;
}

/**
 * Parse description from HTML with fallback chain
 */
function parseDescription(html: string): string | null {
  // 1. og:description
  const ogDesc = parseMetaContent(html, "og:description");
  if (ogDesc) return decodeHtmlEntities(ogDesc);
  
  // 2. twitter:description
  const twitterDesc = parseMetaContent(html, "twitter:description", true);
  if (twitterDesc) return decodeHtmlEntities(twitterDesc);
  
  // 3. meta description
  const metaDesc = parseMetaContent(html, "description", true);
  if (metaDesc) return decodeHtmlEntities(metaDesc);
  
  return null;
}

/**
 * Parse image URL from HTML with fallback chain
 */
function parseImageUrl(html: string): string | null {
  // 1. og:image
  const ogImage = parseMetaContent(html, "og:image");
  if (ogImage) return ogImage;
  
  // 2. twitter:image
  const twitterImage = parseMetaContent(html, "twitter:image", true);
  if (twitterImage) return twitterImage;
  
  return null;
}

/**
 * Parse published date from HTML with fallback chain
 */
function parsePublishedAt(html: string): string | null {
  // 1. article:published_time
  const articleTime = parseMetaContent(html, "article:published_time");
  if (articleTime) return articleTime;
  
  // 2. datePublished in JSON-LD
  const jsonLdMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/i);
  if (jsonLdMatch?.[1]) return jsonLdMatch[1];
  
  // 3. time[datetime] element
  const timeMatch = html.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i);
  if (timeMatch?.[1]) return timeMatch[1];
  
  // 4. published_time meta
  const publishedTime = parseMetaContent(html, "published_time");
  if (publishedTime) return publishedTime;
  
  return null;
}

/**
 * Parse reading time from HTML or estimate from content
 */
function parseReadingTime(html: string): string | null {
  // 1. twitter:data1 (some sites put reading time here)
  const twitterData = parseMetaContent(html, "twitter:data1", true);
  if (twitterData && twitterData.toLowerCase().includes("min")) {
    return twitterData;
  }
  
  // 2. Look for common reading time patterns in HTML
  const readingTimePatterns = [
    /(\d+)\s*min(?:ute)?s?\s*read/i,
    /read(?:ing)?\s*time[:\s]*(\d+)\s*min/i,
    /(\d+)\s*min\s*read/i,
  ];
  
  for (const pattern of readingTimePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return `${match[1]} min read`;
    }
  }
  
  // 3. Estimate from word count (average 200 words/min)
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  const wordCount = textContent.split(/\s+/).length;
  if (wordCount > 100) {
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  }
  
  return null;
}

/**
 * Parse publisher/site name from HTML or URL
 */
function parsePublisher(html: string, url: string): string | null {
  // 1. og:site_name
  const ogSiteName = parseMetaContent(html, "og:site_name");
  if (ogSiteName) return decodeHtmlEntities(ogSiteName);
  
  // 2. application-name meta
  const appName = parseMetaContent(html, "application-name", true);
  if (appName) return decodeHtmlEntities(appName);
  
  // 3. publisher in JSON-LD
  const jsonLdMatch = html.match(/"publisher"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/i);
  if (jsonLdMatch?.[1]) return decodeHtmlEntities(jsonLdMatch[1]);
  
  // 4. Fallback: extract from domain name
  try {
    const hostname = new URL(url).hostname;
    // Remove www. and get domain name
    const domain = hostname.replace(/^www\./, "").split(".")[0];
    if (!domain) return null;
    // Capitalize first letter
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return null;
  }
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * API Route để scrape article metadata từ URL
 * GET /api/article-meta?url=https://example.com/article
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing 'url' parameter" },
      { status: 400 }
    );
  }

  try {
    // Validate URL
    const targetUrl = new URL(url);
    
    // Try all bot headers until one succeeds
    let response: Response | null = null;
    for (const headers of BOT_HEADERS_LIST) {
      response = await fetch(targetUrl.toString(), {
        headers,
        next: { revalidate: 86400 }, // Cache 24 hours
      });
      if (response.ok) break;
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response?.status || "unknown"}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Parse all metadata
    const metadata: ArticleMeta = {
      title: parseTitle(html),
      description: parseDescription(html),
      imageUrl: parseImageUrl(html),
      publishedAt: parsePublishedAt(html),
      readingTime: parseReadingTime(html),
      publisher: parsePublisher(html, url),
    };

    return NextResponse.json(metadata, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error fetching article metadata:", error);
    return NextResponse.json(
      { error: "Failed to parse URL or fetch content" },
      { status: 500 }
    );
  }
}
