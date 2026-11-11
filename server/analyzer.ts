import https from 'https';
import http from 'http';
import { URL } from 'url';

export interface AuditReportData {
  id: string;
  target_url: string;
  normalized_domain: string;
  analyzed_at: string;
  detected_platform: {
    platform: 'shopify' | 'woocommerce' | 'magento' | 'bigcommerce' | 'opencart' | 'custom' | 'unknown';
    confidence: number;
    evidence: string[];
  };
  overall_score: number;
  category_scores: {
    technical_seo: number;
    performance: number;
    ux_conversion: number;
    product_optimization: number;
    trust_signals: number;
    content_quality: number;
    technical_health: number;
  };
  scoring_weights: Record<string, string>;
  executive_summary: string;
  findings: Array<{
    id: string;
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    issue_name: string;
    affected_url: string;
    evidence: string;
    explanation: string;
    recommended_solution: string;
    is_measured: boolean;
  }>;
  quick_wins: string[];
  thirty_day_roadmap: Array<{
    week: string;
    title: string;
    tasks: string[];
    impact: 'High' | 'Medium' | 'Critical';
  }>;
  metrics: {
    response_time_ms: number;
    html_size_kb: number;
    status_code: number;
    is_https: boolean;
    has_viewport: boolean;
    title_length: number;
    meta_desc_length: number;
    h1_count: number;
    total_images: number;
    missing_alt_images: number;
    internal_links_count: number;
    external_links_count: number;
    has_cart: boolean;
    has_checkout: boolean;
    has_search: boolean;
    has_structured_data: boolean;
    has_reviews_widget: boolean;
    has_privacy_policy: boolean;
    has_terms: boolean;
    has_return_policy: boolean;
    has_contact_page: boolean;
  };
}

// SSRF Protection: Check if URL host resolves to private/internal IPs
function isBlockedTarget(parsedUrl: URL): { blocked: boolean; reason?: string } {
  const hostname = parsedUrl.hostname.toLowerCase();

  // Disallow non HTTP/HTTPS
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { blocked: true, reason: 'Only HTTP and HTTPS protocols are supported' };
  }

  // Disallow localhost and link-local
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local')
  ) {
    return { blocked: true, reason: 'Localhost and internal networks cannot be scanned' };
  }

  // Cloud metadata endpoint
  if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
    return { blocked: true, reason: 'Cloud metadata access is prohibited' };
  }

  // Private IPv4 ranges
  const ipParts = hostname.split('.').map(Number);
  if (ipParts.length === 4 && ipParts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    if (
      ipParts[0] === 10 ||
      (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
      (ipParts[0] === 192 && ipParts[1] === 168) ||
      (ipParts[0] === 169 && ipParts[1] === 254) ||
      ipParts[0] === 127 ||
      ipParts[0] === 0
    ) {
      return { blocked: true, reason: 'Private IP ranges are blocked for SSRF security' };
    }
  }

  return { blocked: false };
}

// Fetch webpage HTML with timeout and safe redirect handling
async function fetchPage(targetUrl: string): Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
  finalUrl: string;
}> {
  const parsed = new URL(targetUrl);
  const check = isBlockedTarget(parsed);
  if (check.blocked) {
    throw new Error(check.reason || 'Invalid or blocked target URL');
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 StorePulseBot/1.0 (+https://storepulse.ai)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;
    const body = await response.text();

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return {
      statusCode: response.status,
      headers,
      body,
      durationMs,
      finalUrl: response.url || targetUrl,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Connection timed out after 12s while reaching ${targetUrl}`);
    }
    throw new Error(`Failed to reach ${targetUrl}: ${err.message}`);
  }
}

export async function analyzeStoreUrl(inputUrl: string): Promise<AuditReportData> {
  // Normalize URL
  let target = inputUrl.trim();
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    target = 'https://' + target;
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    throw new Error('Please provide a valid HTTP or HTTPS website URL');
  }

  const ssrfCheck = isBlockedTarget(parsed);
  if (ssrfCheck.blocked) {
    throw new Error(ssrfCheck.reason);
  }

  const normalizedDomain = parsed.hostname.replace(/^www\./, '');

  // Perform real HTTP fetch
  const fetchResult = await fetchPage(target);
  const html = fetchResult.body;
  const lowerHtml = html.toLowerCase();
  const headers = fetchResult.headers;
  const isHttps = fetchResult.finalUrl.startsWith('https://');

  // 1. Platform Detection
  let detectedPlatform: 'shopify' | 'woocommerce' | 'magento' | 'bigcommerce' | 'opencart' | 'custom' | 'unknown' = 'unknown';
  let platformConfidence = 0.5;
  const platformEvidence: string[] = [];

  if (
    lowerHtml.includes('cdn.shopify.com') ||
    lowerHtml.includes('shopify.theme') ||
    lowerHtml.includes('window.shopify') ||
    lowerHtml.includes('shopify-section') ||
    lowerHtml.includes('myshopify.com')
  ) {
    detectedPlatform = 'shopify';
    platformConfidence = 0.98;
    if (lowerHtml.includes('cdn.shopify.com')) platformEvidence.push('Shopify CDN assets referenced');
    if (lowerHtml.includes('shopify-section')) platformEvidence.push('Shopify Sections Liquid architecture detected');
    if (lowerHtml.includes('window.shopify')) platformEvidence.push('Global Shopify JavaScript object present');
  } else if (
    lowerHtml.includes('wp-content/plugins/woocommerce') ||
    lowerHtml.includes('woocommerce-js') ||
    lowerHtml.includes('wc-block') ||
    lowerHtml.includes('woocommerce-no-js')
  ) {
    detectedPlatform = 'woocommerce';
    platformConfidence = 0.96;
    if (lowerHtml.includes('wp-content/plugins/woocommerce')) platformEvidence.push('WooCommerce WordPress plugin directory assets found');
    if (lowerHtml.includes('woocommerce-js')) platformEvidence.push('WooCommerce JavaScript client active');
  } else if (
    lowerHtml.includes('mage/cookies') ||
    lowerHtml.includes('static/version') ||
    lowerHtml.includes('mage.cookies') ||
    lowerHtml.includes('magento_')
  ) {
    detectedPlatform = 'magento';
    platformConfidence = 0.92;
    platformEvidence.push('Adobe Commerce / Magento theme cookies and static assets observed');
  } else if (
    lowerHtml.includes('cdn.bigcommerce.com') ||
    lowerHtml.includes('stencil-') ||
    lowerHtml.includes('bc-sf-filter')
  ) {
    detectedPlatform = 'bigcommerce';
    platformConfidence = 0.94;
    platformEvidence.push('BigCommerce Stencil theme engine and CDN discovered');
  } else if (lowerHtml.includes('catalog/view/javascript') || lowerHtml.includes('index.php?route=')) {
    detectedPlatform = 'opencart';
    platformConfidence = 0.88;
    platformEvidence.push('OpenCart directory routing structure discovered');
  } else {
    detectedPlatform = 'custom';
    platformConfidence = 0.70;
    platformEvidence.push('Proprietary / Custom headless e-commerce stack');
  }

  // 2. Metadata & SEO extraction
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].trim() : '';

  const metaDescMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : '';

  const hasViewport = lowerHtml.includes('name="viewport"') || lowerHtml.includes("name='viewport'");
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const robotsDirectives = robotsMatch ? robotsMatch[1].toLowerCase() : '';

  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

  // Headings
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || [];

  // Images & Alt tags
  const imgMatches = html.match(/<img\b[^>]*>/gi) || [];
  let missingAltCount = 0;
  imgMatches.forEach((img) => {
    if (!/alt=["'][^"']+["']/i.test(img)) {
      missingAltCount++;
    }
  });

  // Links & Policies
  const hasPrivacy = /privacy[- ]?policy/i.test(html) || lowerHtml.includes('/privacy');
  const hasTerms = /terms[- ]?(of[- ]?service|conditions)/i.test(html) || lowerHtml.includes('/terms');
  const hasReturns = /return[- ]?policy|refund[- ]?policy/i.test(html) || lowerHtml.includes('/returns') || lowerHtml.includes('/refunds');
  const hasShipping = /shipping[- ]?policy|delivery[- ]?info/i.test(html) || lowerHtml.includes('/shipping');
  const hasContact = /contact[- ]?us/i.test(html) || lowerHtml.includes('/contact') || /mailto:[a-zA-Z0-9._%+-]+@/.test(html);

  // E-commerce Features
  const hasCart = /href=["'][^"']*\/(cart|bag|basket)["']/i.test(html) || lowerHtml.includes('cart-drawer') || lowerHtml.includes('site-cart');
  const hasCheckout = /href=["'][^"']*\/(checkout)["']/i.test(html) || lowerHtml.includes('checkout');
  const hasSearch = lowerHtml.includes('type="search"') || lowerHtml.includes('name="q"') || lowerHtml.includes('/search');
  const hasStructuredData = lowerHtml.includes('application/ld+json') && (lowerHtml.includes('"@type"') || lowerHtml.includes('schema.org'));
  const hasReviews =
    lowerHtml.includes('yotpo') ||
    lowerHtml.includes('trustpilot') ||
    lowerHtml.includes('reviews.io') ||
    lowerHtml.includes('judge.me') ||
    lowerHtml.includes('stamped.io') ||
    lowerHtml.includes('loox') ||
    lowerHtml.includes('rating-star') ||
    lowerHtml.includes('star-rating');

  // Security Headers
  const hasHsts = Boolean(headers['strict-transport-security']);
  const hasXContentType = Boolean(headers['x-content-type-options']);

  // Performance calculations
  const htmlSizeKb = Math.round((Buffer.byteLength(html, 'utf8') / 1024) * 10) / 10;
  const responseTimeMs = fetchResult.durationMs;

  // 3. DETERMINISTIC SCORING ENGINE (v1.0.0)
  // Each category is scored 0-100 based on measured conditions

  // Technical SEO (20%)
  let seoScore = 100;
  if (!pageTitle) seoScore -= 30;
  else if (pageTitle.length < 25 || pageTitle.length > 70) seoScore -= 10;

  if (!metaDescription) seoScore -= 25;
  else if (metaDescription.length < 90 || metaDescription.length > 170) seoScore -= 10;

  if (h1Matches.length === 0) seoScore -= 20;
  else if (h1Matches.length > 1) seoScore -= 8;

  if (!canonicalUrl) seoScore -= 10;
  if (robotsDirectives.includes('noindex')) seoScore -= 40;
  if (!ogTitle || !ogImage) seoScore -= 10;
  seoScore = Math.max(20, Math.min(100, seoScore));

  // Performance (20%)
  let perfScore = 100;
  if (responseTimeMs > 1500) perfScore -= 35;
  else if (responseTimeMs > 800) perfScore -= 20;
  else if (responseTimeMs > 450) perfScore -= 10;

  if (htmlSizeKb > 500) perfScore -= 25;
  else if (htmlSizeKb > 250) perfScore -= 15;
  perfScore = Math.max(30, Math.min(100, perfScore));

  // UX & Conversion (20%)
  let uxScore = 100;
  if (!hasViewport) uxScore -= 35;
  if (!hasCart) uxScore -= 20;
  if (!hasSearch) uxScore -= 15;
  if (!hasCheckout) uxScore -= 15;
  uxScore = Math.max(25, Math.min(100, uxScore));

  // Product Optimization (15%)
  let prodScore = 85;
  if (!hasStructuredData) prodScore -= 30;
  if (!hasReviews) prodScore -= 25;
  if (imgMatches.length > 0 && missingAltCount / imgMatches.length > 0.4) prodScore -= 15;
  prodScore = Math.max(20, Math.min(100, prodScore));

  // Trust Signals (10%)
  let trustScore = 100;
  if (!isHttps) trustScore -= 40;
  if (!hasPrivacy) trustScore -= 20;
  if (!hasTerms) trustScore -= 15;
  if (!hasReturns) trustScore -= 15;
  if (!hasContact) trustScore -= 10;
  trustScore = Math.max(15, Math.min(100, trustScore));

  // Content Quality (10%)
  let contentScore = 95;
  if (missingAltCount > 5) contentScore -= 25;
  else if (missingAltCount > 0) contentScore -= 10;
  if (h2Matches.length === 0) contentScore -= 15;
  contentScore = Math.max(30, Math.min(100, contentScore));

  // Technical Health (5%)
  let healthScore = 100;
  if (fetchResult.statusCode !== 200) healthScore -= 40;
  if (!hasHsts) healthScore -= 15;
  if (!hasXContentType) healthScore -= 10;
  healthScore = Math.max(20, Math.min(100, healthScore));

  // Overall Weighted Score
  // Weights: SEO: 0.20, Perf: 0.20, UX: 0.20, Product: 0.15, Trust: 0.10, Content: 0.10, Health: 0.05
  const overallScore = Math.round(
    seoScore * 0.2 +
      perfScore * 0.2 +
      uxScore * 0.2 +
      prodScore * 0.15 +
      trustScore * 0.1 +
      contentScore * 0.1 +
      healthScore * 0.05
  );

  // 4. GENERATE GRANULAR AUDIT FINDINGS
  const findings: AuditReportData['findings'] = [];

  // Findings: Technical SEO
  if (!pageTitle) {
    findings.push({
      id: 'f-seo-title-missing',
      category: 'technical_seo',
      severity: 'critical',
      issue_name: 'Missing Primary <title> Tag',
      affected_url: target,
      evidence: '<title> element not discovered in <head>',
      explanation: 'Search engines require page titles to understand target queries and generate search snippet headers.',
      recommended_solution: 'Add a descriptive title between 50-60 characters incorporating primary store keywords and brand identity.',
      is_measured: true,
    });
  } else if (pageTitle.length < 30 || pageTitle.length > 70) {
    findings.push({
      id: 'f-seo-title-length',
      category: 'technical_seo',
      severity: 'medium',
      issue_name: 'Title Length Suboptimal for Search Snippets',
      affected_url: target,
      evidence: `Title is ${pageTitle.length} characters: "${pageTitle.substring(0, 40)}..."`,
      explanation: 'Search engines display up to ~60 characters before truncating with ellipses. Too short titles fail to communicate keyword context.',
      recommended_solution: 'Tune title length to 50-60 characters, placing primary keyword first followed by store brand.',
      is_measured: true,
    });
  }

  if (!metaDescription) {
    findings.push({
      id: 'f-seo-meta-desc-missing',
      category: 'technical_seo',
      severity: 'high',
      issue_name: 'Missing Meta Description',
      affected_url: target,
      evidence: '<meta name="description"> tag missing from document head',
      explanation: 'Without a defined meta description, search engines pull arbitrary text snippets which lowers organic click-through rates (CTR).',
      recommended_solution: 'Define a compelling, conversion-focused meta description between 120-155 characters featuring value proposition and incentives.',
      is_measured: true,
    });
  }

  if (h1Matches.length === 0) {
    findings.push({
      id: 'f-seo-h1-missing',
      category: 'technical_seo',
      severity: 'high',
      issue_name: 'No <h1> Heading Tag Found',
      affected_url: target,
      evidence: 'Zero <h1> elements located in page markup',
      explanation: 'The H1 tag serves as the main content anchor for both screen readers and search crawlers.',
      recommended_solution: 'Include exactly one prominent <h1> tag on the homepage encapsulating your primary store category or brand statement.',
      is_measured: true,
    });
  } else if (h1Matches.length > 1) {
    findings.push({
      id: 'f-seo-h1-multiple',
      category: 'technical_seo',
      severity: 'medium',
      issue_name: 'Multiple <h1> Heading Tags Detected',
      affected_url: target,
      evidence: `Found ${h1Matches.length} distinct <h1> tags`,
      explanation: 'Multiple H1 tags dilute topic clarity. Standards recommend a single top-level H1 followed by structured H2/H3 hierarchies.',
      recommended_solution: 'Consolidate page structure so only the primary headline uses <h1>, converting secondary headers into <h2>.',
      is_measured: true,
    });
  }

  if (!canonicalUrl) {
    findings.push({
      id: 'f-seo-canonical-missing',
      category: 'technical_seo',
      severity: 'medium',
      issue_name: 'Self-Referential Canonical Tag Not Specified',
      affected_url: target,
      evidence: '<link rel="canonical"> tag absent from page head',
      explanation: 'Canonical tags prevent duplicate content indexing caused by query parameters, session IDs, or tracking campaigns.',
      recommended_solution: `Add <link rel="canonical" href="${target}"> in the <head> section.`,
      is_measured: true,
    });
  }

  // Findings: Performance
  if (responseTimeMs > 1000) {
    findings.push({
      id: 'f-perf-ttfb',
      category: 'performance',
      severity: 'high',
      issue_name: 'Elevated Server Time to First Byte (TTFB)',
      affected_url: target,
      evidence: `Initial HTML response took ${responseTimeMs}ms (recommended: <400ms)`,
      explanation: 'Slow initial server response delays all downstream asset downloads, hurting mobile conversions and Core Web Vitals.',
      recommended_solution: 'Implement full-page caching at the CDN/Edge layer (Cloudflare or Fastly) and evaluate database query load.',
      is_measured: true,
    });
  }

  if (htmlSizeKb > 350) {
    findings.push({
      id: 'f-perf-html-size',
      category: 'performance',
      severity: 'medium',
      issue_name: 'Bulky Initial HTML Payload',
      affected_url: target,
      evidence: `Uncompressed HTML document is ${htmlSizeKb} KB`,
      explanation: 'Large HTML payloads often contain bloat from inline base64 images, large JSON blobs, or heavy inline scripts.',
      recommended_solution: 'Enable Brotli or Gzip compression, externalize inline JSON payloads, and defer non-critical CSS/JS.',
      is_measured: true,
    });
  }

  // Findings: UX & Conversion
  if (!hasViewport) {
    findings.push({
      id: 'f-ux-viewport-missing',
      category: 'ux_conversion',
      severity: 'critical',
      issue_name: 'Mobile Viewport Configuration Missing',
      affected_url: target,
      evidence: '<meta name="viewport"> tag not detected',
      explanation: 'Mobile browsers will render desktop scale, resulting in tiny text, horizontal scrolling, and poor mobile shopping experience.',
      recommended_solution: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> in <head>.',
      is_measured: true,
    });
  }

  if (!hasSearch) {
    findings.push({
      id: 'f-ux-search-absent',
      category: 'ux_conversion',
      severity: 'medium',
      issue_name: 'No Readily Visible Store Search Input',
      affected_url: target,
      evidence: 'No search input or /search action observed in page header markup',
      explanation: 'Shoppers who use on-site search convert at 1.8x to 2.4x the rate of browse-only visitors.',
      recommended_solution: 'Implement a prominent search input with predictive autocomplete in the global header.',
      is_measured: true,
    });
  }

  // Findings: Product Optimization
  if (!hasStructuredData) {
    findings.push({
      id: 'f-prod-schema-missing',
      category: 'product_optimization',
      severity: 'high',
      issue_name: 'Structured Data Schema (JSON-LD) Missing',
      affected_url: target,
      evidence: 'No schema.org structured data scripts discovered',
      explanation: 'Search engines use Product and Merchant schemas to display rich results (star ratings, prices, availability, badges) in Google Shopping.',
      recommended_solution: 'Embed schema.org JSON-LD scripts with Organization, WebSite, and Product entity specifications.',
      is_measured: true,
    });
  }

  if (imgMatches.length > 0 && missingAltCount > 0) {
    findings.push({
      id: 'f-prod-missing-alt',
      category: 'product_optimization',
      severity: missingAltCount > 5 ? 'high' : 'medium',
      issue_name: 'Product & Store Images Missing Descriptive Alt Attributes',
      affected_url: target,
      evidence: `${missingAltCount} out of ${imgMatches.length} <img> tags lack descriptive alt text`,
      explanation: 'Missing alt text penalizes image search rankings on Google Images and creates accessibility barriers.',
      recommended_solution: 'Add descriptive, keyword-rich alt text to every product photo describing the product, color, and angle.',
      is_measured: true,
    });
  }

  if (!hasReviews) {
    findings.push({
      id: 'f-prod-reviews-absent',
      category: 'product_optimization',
      severity: 'medium',
      issue_name: 'Customer Reviews / Social Proof Widget Not Visible on Homepage',
      affected_url: target,
      evidence: 'No verified review widget (Yotpo, Trustpilot, Loox, Judge.me) or star rating elements found',
      explanation: 'Customer testimonials and review proof on the homepage elevate buyer trust and reduce cart abandonment.',
      recommended_solution: 'Integrate a verified customer review showcase badge or testimonial carousel on the homepage.',
      is_measured: true,
    });
  }

  // Findings: Trust Signals
  if (!isHttps) {
    findings.push({
      id: 'f-trust-no-https',
      category: 'trust_signals',
      severity: 'critical',
      issue_name: 'Unencrypted HTTP Connection (No SSL/TLS)',
      affected_url: target,
      evidence: 'URL loaded over insecure http:// protocol',
      explanation: 'Browsers display a prominent "Not Secure" warning in the address bar, causing buyers to immediately abandon checkout.',
      recommended_solution: 'Install an SSL certificate and configure 301 permanent redirects from HTTP to HTTPS across all routes.',
      is_measured: true,
    });
  }

  if (!hasPrivacy || !hasTerms || !hasReturns) {
    const missingPolicies: string[] = [];
    if (!hasPrivacy) missingPolicies.push('Privacy Policy');
    if (!hasTerms) missingPolicies.push('Terms of Service');
    if (!hasReturns) missingPolicies.push('Return / Refund Policy');

    findings.push({
      id: 'f-trust-policies-missing',
      category: 'trust_signals',
      severity: 'medium',
      issue_name: 'Crucial Store Policy Links Not Discovered in Footer',
      affected_url: target,
      evidence: `Missing observable links for: ${missingPolicies.join(', ')}`,
      explanation: 'Payment gateways (Stripe, PayPal, Google Pay) and ad networks require clear, accessible return, terms, and privacy links.',
      recommended_solution: 'Ensure footer navigation includes dedicated links to Privacy Policy, Terms of Service, and Return & Refund Policy.',
      is_measured: true,
    });
  }

  // Quick Wins (Top 5 immediate actionable fixes)
  const quickWins = [
    !pageTitle || pageTitle.length < 30
      ? 'Optimize Homepage Title Tag: Craft a 55-character title featuring your primary niche and store brand.'
      : 'Enhance Title CTR: Add value hooks like "Fast Shipping" or "Official Store" to your page title.',
    !metaDescription
      ? 'Add High-Converting Meta Description: Write 150 characters showcasing unique value propositions and compelling CTA.'
      : 'A/B Test Meta Description: Include clear guarantees or promotional offers to improve Google SERP click-through rates.',
    missingAltCount > 0
      ? `Audit Image Alt Text: Add descriptive alt attributes to the ${missingAltCount} unoptimized images discovered on the page.`
      : 'Compress Hero Imagery: Convert existing PNG/JPEG assets into modern WebP format for faster paint times.',
    !hasStructuredData
      ? 'Implement Schema.org JSON-LD: Enable Google rich snippets with Organization and Product structured data.'
      : 'Verify Rich Snippet Health: Validate schema with Google Search Console Rich Results test.',
    !hasReturns
      ? 'Add Return Policy Link to Footer: Reassure first-time shoppers with a clear 30-day return policy link.'
      : 'Display Trust Badges near Checkout: Showcase secure payment icons and money-back guarantees.',
  ];

  // 30-Day Tactical Improvement Roadmap
  const thirtyDayRoadmap: AuditReportData['thirty_day_roadmap'] = [
    {
      week: 'Week 1: Critical SEO & Security Stabilization',
      title: 'Fix High-Severity Crawl & Indexing Blockers',
      impact: 'Critical',
      tasks: [
        !pageTitle ? 'Deploy optimized <title> tag' : 'Refine title tag keyword targeting',
        !metaDescription ? 'Write and deploy primary meta description' : 'Optimize meta description snippet',
        !hasViewport ? 'Implement mobile viewport configuration' : 'Verify mobile tap target spacing',
        h1Matches.length !== 1 ? 'Standardize H1 hierarchy across page markup' : 'Audit heading keywords for search intent',
      ],
    },
    {
      week: 'Week 2: On-Page Conversion & UX Friction Reduction',
      title: 'Streamline Product Discovery & Buyer Funnel',
      impact: 'High',
      tasks: [
        'Add prominent search bar in sticky mobile and desktop header',
        'Audit cart drawer slide-out responsiveness and checkout button visibility',
        'Verify clear pricing, variant selector clarity, and stock availability signals',
        'Place customer trust and security guarantee icons adjacent to primary purchase CTAs',
      ],
    },
    {
      week: 'Week 3: Speed Optimization & Asset Compression',
      title: 'Elevate Core Web Vitals & Server Performance',
      impact: 'High',
      tasks: [
        'Implement WebP image conversion across all product photography',
        'Configure Edge CDN caching to reduce server response time under 400ms',
        'Defer non-critical third-party analytics and chat widget scripts',
        'Eliminate render-blocking CSS stylesheets',
      ],
    },
    {
      week: 'Week 4: Trust Architecture & Growth Scaling',
      title: 'Solidify Buyer Confidence & Ongoing Monitoring',
      impact: 'Medium',
      tasks: [
        'Publish comprehensive Return, Shipping, and Privacy policy pages',
        'Embed verified customer review badges and customer testimonials',
        'Deploy Schema.org JSON-LD rich snippets for Google Shopping indexing',
        'Set up automated weekly store monitoring to catch broken links and speed regressions',
      ],
    },
  ];

  // Synthesize Executive Summary
  const executiveSummary = `StorePulse AI completed an automated diagnostic analysis of ${normalizedDomain} on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. The site runs on the ${detectedPlatform.toUpperCase()} platform with ${Math.round(platformConfidence * 100)}% detection confidence. The store achieved an overall health score of ${overallScore}/100. We identified ${findings.filter((f) => f.severity === 'critical').length} critical issues, ${findings.filter((f) => f.severity === 'high').length} high-priority opportunities, and ${findings.filter((f) => f.severity === 'medium').length} medium-priority improvements across technical SEO, performance, UX funnels, product schema, and buyer trust signals. Implementing the prioritized 30-day roadmap will systematically eliminate crawl friction and elevate buyer conversion rates.`;

  return {
    id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    target_url: target,
    normalized_domain: normalizedDomain,
    analyzed_at: new Date().toISOString(),
    detected_platform: {
      platform: detectedPlatform,
      confidence: platformConfidence,
      evidence: platformEvidence,
    },
    overall_score: overallScore,
    category_scores: {
      technical_seo: seoScore,
      performance: perfScore,
      ux_conversion: uxScore,
      product_optimization: prodScore,
      trust_signals: trustScore,
      content_quality: contentScore,
      technical_health: healthScore,
    },
    scoring_weights: {
      technical_seo: '20%',
      performance: '20%',
      ux_conversion: '20%',
      product_optimization: '15%',
      trust_signals: '10%',
      content_quality: '10%',
      technical_health: '5%',
    },
    executive_summary: executiveSummary,
    findings,
    quick_wins: quickWins,
    thirty_day_roadmap: thirtyDayRoadmap,
    metrics: {
      response_time_ms: responseTimeMs,
      html_size_kb: htmlSizeKb,
      status_code: fetchResult.statusCode,
      is_https: isHttps,
      has_viewport: hasViewport,
      title_length: pageTitle.length,
      meta_desc_length: metaDescription.length,
      h1_count: h1Matches.length,
      total_images: imgMatches.length,
      missing_alt_images: missingAltCount,
      internal_links_count: (html.match(/href=["'](\/[^"']*)["']/gi) || []).length,
      external_links_count: (html.match(/href=["']https?:\/\/[^"']*["']/gi) || []).length,
      has_cart: hasCart,
      has_checkout: hasCheckout,
      has_search: hasSearch,
      has_structured_data: hasStructuredData,
      has_reviews_widget: hasReviews,
      has_privacy_policy: hasPrivacy,
      has_terms: hasTerms,
      has_return_policy: hasReturns,
      has_contact_page: hasContact,
    },
  };
}
