import React, { useState } from 'react';
import {
  Search,
  Gauge,
  ShoppingCart,
  ShieldCheck,
  Check,
  ArrowRight,
  TrendingUp,
  Zap,
  Clock,
  Sparkles,
  Copy,
  FileText,
  Store,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  MousePointerClick,
  Users,
} from 'lucide-react';

import { AuditReportData } from '../../../server/analyzer.ts';
import { UrlAnalyzerBar } from '../audit/UrlAnalyzerBar.tsx';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onNavigate: (view: 'landing' | 'dashboard' | 'pricing' | 'how-it-works') => void;
  onReportGenerated: (report: AuditReportData) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onNavigate,
  onReportGenerated,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'shopify' | 'woocommerce' | 'custom'>('shopify');
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const sampleSolutions = {
    shopify: {
      platform: 'Shopify Store',
      file: 'sections/main-product.liquid',
      fixTitle: 'Add High-Converting Google Product Schema (JSON-LD)',
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{{ product.title | escape }}",
  "image": "{{ product.featured_image | image_url: width: 800 }}",
  "description": "{{ product.description | strip_html | truncatewords: 40 | escape }}",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "{{ cart.currency.iso_code }}",
    "price": "{{ product.selected_or_first_available_variant.price | divided_by: 100.00 }}",
    "availability": "https://schema.org/{% if product.available %}InStock{% else %}OutOfStock{% endif %}"
  }
}
</script>`,
      benefit: 'Instantly qualifies your products for Google Shopping free listings with star ratings and pricing.',
    },
    woocommerce: {
      platform: 'WooCommerce / WordPress',
      file: 'functions.php or Theme Header',
      fixTitle: 'Preload LCP Product Hero & Defer Blocking CSS',
      code: `// Preload the primary product image for sub-second LCP
add_action('wp_head', function() {
    if (is_product()) {
        global $product;
        $image_id = $product->get_image_id();
        $src = wp_get_attachment_image_url($image_id, 'woocommerce_single');
        if ($src) {
            echo '<link rel="preload" as="image" href="' . esc_url($src) . '" fetchpriority="high">';
        }
    }
}, 1);`,
      benefit: 'Eliminates 1.2s of mobile render-blocking delay, lifting checkout conversion rates immediately.',
    },
    custom: {
      platform: 'Custom Code / Headless Storefront',
      file: 'public/index.html or <head> layout',
      fixTitle: 'Instant Mobile Viewport & Security Headers',
      code: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>
<link rel="dns-prefetch" href="https://fonts.googleapis.com">`,
      benefit: 'Enforces HTTPS everywhere and prevents mobile browser pinching glitches that cause cart abandonment.',
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleSolutions[selectedPlatform].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const coreFeatures = [
    {
      badge: 'Organic Sales',
      title: 'Rank #1 on Google Without Paid Ads',
      howItHelps: 'Stop burning budget on rising Facebook and TikTok ads. Automatically detect missing SEO tags, broken sitemaps, and rich product schema so your store drives free organic search buyers every day.',
      icon: Search,
      stat: '+42% Organic Reach',
    },
    {
      badge: 'Speed Turbo',
      title: 'Sub-Second Speed That Eliminates Bounces',
      howItHelps: 'Every 1-second mobile delay cuts conversions by 7%. StorePulse pinpoints heavy uncompressed product images, render-blocking scripts, and server lag so mobile shoppers never leave out of frustration.',
      icon: Gauge,
      stat: '1.2s Average Load Time',
    },
    {
      badge: 'Revenue Recovery',
      title: 'Fix Hidden Cart & Checkout Leaks',
      howItHelps: '70% of shoppers abandon carts before paying. We analyze your purchase funnel to reveal confusing mobile menus, broken promo fields, and friction points so more visitors finish their purchase.',
      icon: ShoppingCart,
      stat: '-35% Cart Drops',
    },
    {
      badge: 'Higher Order Value',
      title: 'Product Page Persuasion Engine',
      howItHelps: 'Turn casual window-shoppers into high-ticket buyers. Audit your product variant selectors, review badge placement, shipping incentives, and return guarantees for maximum conversion trust.',
      icon: TrendingUp,
      stat: '+24% Average AOV',
    },
    {
      badge: 'Buyer Confidence',
      title: 'Bulletproof Store Trust & Security',
      howItHelps: 'First-time visitors won\'t pull out their credit card on a store they don\'t trust. Detect missing SSL warnings, security headers, return policy disclosures, and trust badge gaps in seconds.',
      icon: ShieldCheck,
      stat: '100% Trust Grade',
    },
    {
      badge: 'Zero Guesswork',
      title: 'Prioritized 30-Day Growth Roadmap',
      howItHelps: 'No marketing degree or technical confusion. You get an exact step-by-step checklist ranked by revenue impact: what to fix today for quick cash, what to fix this week, and what to optimize this month.',
      icon: Sparkles,
      stat: 'Ready-to-Deploy Fixes',
    },
  ];

  const faqs = [
    {
      q: 'How fast does an audit take?',
      a: 'Under 15 seconds! Simply paste your store link. Our crawler tests your live storefront, analyzes your search visibility, measures mobile speed, and generates your complete report with copyable fixes instantly.',
    },
    {
      q: 'Do I need technical or coding skills to fix my store?',
      a: 'None at all. For every single issue detected, StorePulse AI provides plain-English explanations and exact, copy-paste code snippets with instructions for Shopify, WooCommerce, or custom stores.',
    },
    {
      q: 'Will this work on my store platform?',
      a: 'Yes! StorePulse AI automatically detects and audits Shopify, WooCommerce (WordPress), Magento, BigCommerce, OpenCart, and custom headless store architectures.',
    },
    {
      q: 'Can I export reports to show clients or my team?',
      a: 'Yes. You can export complete diagnostic reports as clean, professional PDFs or share an interactive web link with clients, stakeholders, or developers.',
    },
    {
      q: 'Is there a free plan to test my store right now?',
      a: 'Yes! You can run free audits right now on the home page without entering a credit card or creating an account.',
    },
  ];

  return (
    <div className="space-y-28 py-10 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative max-w-6xl mx-auto px-4 text-center">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Top Benefit Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Stop losing sales to slow speeds & checkout friction</span>
          <span className="text-slate-400 hidden sm:inline">· 15-Second Instant Audit</span>
        </div>

        {/* Main Marketing Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
          Turn Store Visitors Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">
            Paying Customers
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          StorePulse AI scans your online store across search rankings, page speed, mobile checkout friction, and trust signals — delivering <span className="text-white font-semibold">exact, ready-to-copy code fixes</span> for Shopify, WooCommerce, and custom stores.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Free Store Audit</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            View Growth Plans
          </button>
        </div>

        {/* Live URL Audit Search Input Bar */}
        <div className="mt-12">
          <UrlAnalyzerBar onReportGenerated={onReportGenerated} />
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              100% Free Live Scan
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              No Credit Card Needed
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              Under 15 Seconds
            </span>
          </div>
        </div>

        {/* Proof KPI Strip */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">15s</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Average Deep Scan Time</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">+28%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Average Conversion Lift</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">7-in-1</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Revenue Growth Audits</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">1-Click</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Ready-to-Copy Code Fixes</div>
          </div>
        </div>
      </section>

      {/* 2. HOW FAST IT WORKS (SPEED & SIMPLICITY SHOWCASE) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            <Clock className="w-4 h-4" />
            <span>Lightning-Fast Execution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From Store URL to Full Growth Plan in 15 Seconds
          </h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            No waiting days for expensive agency consultants. StorePulse automates the complete diagnostic workflow so you can boost your sales today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="p-7 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-6 right-6 text-2xl font-extrabold text-slate-800 group-hover:text-indigo-500/20 transition-colors">
              01
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Paste Your Store Link</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simply enter any public store URL (Shopify, WooCommerce, Magento, or custom). Our crawler instantly launches multi-page analysis in real-time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-semibold text-indigo-400 flex items-center gap-1.5">
              <span>Elapsed: 0 to 3 seconds</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-7 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-6 right-6 text-2xl font-extrabold text-slate-800 group-hover:text-indigo-500/20 transition-colors">
              02
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Uncover Hidden Revenue Leaks</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We inspect 7 core growth pillars: page speed, Google Shopping rich tags, checkout drop-off triggers, mobile navigation, and security seals.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-semibold text-indigo-400 flex items-center gap-1.5">
              <span>Elapsed: 3 to 12 seconds</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-7 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-6 right-6 text-2xl font-extrabold text-slate-800 group-hover:text-indigo-500/20 transition-colors">
              03
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Copy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Deploy Ready Code & Grow</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receive prioritized action steps with tailor-made, copy-paste code snippets for your exact store platform. Deploy fixes in minutes, not months.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-semibold text-indigo-400 flex items-center gap-1.5">
              <span>Elapsed: Instant 1-Click Fixes</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FUNCTIONALITY & HOW IT HELPS PEOPLE (MARKETING BENEFIT GRID) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            <Zap className="w-4 h-4" />
            <span>Built To Make Your Store More Money</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need To Scale Your E-Commerce Sales
          </h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            StorePulse doesn't just list technical errors. It translates store health into practical, high-ROI actions designed to grow your store revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-indigo-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {feat.howItHelps}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Impact Result:</span>
                  <span className="font-semibold text-indigo-400">{feat.stat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PLATFORM-TAILORED SOLUTIONS DEMO (SHOPIFY VS WOOCOMMERCE VS CUSTOM) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
              <Store className="w-4 h-4" />
              <span>Tailor-Made For Your Store Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready-to-Paste Code for Your Exact Store Engine
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Unlike generic audit tools that leave you guessing, StorePulse produces platform-specific instructions and ready code snippets for Shopify, WooCommerce, or custom sites.
            </p>
          </div>

          {/* Platform Tab Selector */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950 rounded-xl max-w-md mb-6 border border-slate-800">
            {(['shopify', 'woocommerce', 'custom'] as const).map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer ${
                  selectedPlatform === platform
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {platform === 'shopify' && 'Shopify (Liquid)'}
                {platform === 'woocommerce' && 'WooCommerce (WP)'}
                {platform === 'custom' && 'Custom / Headless'}
              </button>
            ))}
          </div>

          {/* Interactive Code Preview Box */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 font-mono text-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-4">
              <div>
                <div className="text-white font-bold text-sm">
                  {sampleSolutions[selectedPlatform].fixTitle}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Paste into: <span className="text-indigo-400">{sampleSolutions[selectedPlatform].file}</span>
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-sm shadow-indigo-600/25"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code Fix</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-slate-300 overflow-x-auto p-3 bg-slate-900/60 rounded-xl leading-relaxed text-[11px]">
              <code>{sampleSolutions[selectedPlatform].code}</code>
            </pre>

            <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{sampleSolutions[selectedPlatform].benefit}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOR AGENCIES & E-COMMERCE OPERATORS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
              <Users className="w-4 h-4" />
              <span>For Growth Agencies & Store Owners</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Win More Store Clients & Automate Your Client Deliverables
            </h2>
            <p className="text-sm text-slate-300 mt-4 leading-relaxed">
              If you run a marketing agency or manage multiple stores, StorePulse AI becomes your unfair advantage. Run audits on prospective client stores during discovery calls to prove where they are bleeding revenue.
            </p>

            <div className="mt-6 space-y-3.5 text-xs text-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  ✓
                </div>
                <span><strong>White-Label PDF Reports:</strong> Add your agency branding and custom logo.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  ✓
                </div>
                <span><strong>Multi-Store Workspace:</strong> Organize up to 25+ client stores from a single unified hub.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  ✓
                </div>
                <span><strong>Shareable Live Audit Links:</strong> Send password-protected client preview links.</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => onNavigate('pricing')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Agency & Team Plans</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Agency Card Preview */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-white font-bold">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Executive Client Audit Report</span>
              </div>
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                Ready to Export
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Target Store Health Score</div>
                  <div className="text-[11px] text-slate-400">Gymshark / Activewear Store</div>
                </div>
                <div className="text-xl font-extrabold text-indigo-400">84/100</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex justify-between">
                  <span>Projected Monthly Revenue Lift</span>
                  <span className="text-emerald-400 font-bold">+$14,200/mo</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Calculated by cutting mobile checkout friction, fixing missing Google Shopping tags, and boosting page speed by 1.8 seconds.
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Ready in 1 click</span>
              <span className="text-white font-semibold">Export PDF · Copy Link · Share</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMMON QUESTIONS (FAQ) */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. HIGH-CONVERTING BOTTOM CTA */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-indigo-600/15 blur-[80px] rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Risk · 15 Seconds</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight">
            Stop Leaving Revenue On The Table.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Test Your Store Now.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Run a free diagnostic audit in seconds. Find out where your store is losing visitors and get instant, step-by-step code solutions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Audit My Store Free</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="w-full sm:w-auto px-6 py-4 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Compare Plans & Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
