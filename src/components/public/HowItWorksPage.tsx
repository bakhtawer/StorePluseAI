import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC<{ onOpenAuth: (mode: 'login' | 'signup') => void }> = ({ onOpenAuth }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
          <span>Evidence-Based Store Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How StorePulse AI Diagnoses Your Store
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
          StorePulse AI strictly measures real storefront data to discover why visitors bounce or abandon carts. 
          No fabricated metrics or vague advice — only concrete evidence and copy-paste code fixes.
        </p>
      </div>

      {/* 3 Steps Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm mb-4">
            01
          </div>
          <h3 className="text-base font-bold text-white mb-2">Real-Time Storefront Crawl</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Crawls your public store pages in under 15 seconds. Extracts live speed timings, Google Shopping metadata, mobile navigation layouts, and checkout links safely.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm mb-4">
            02
          </div>
          <h3 className="text-base font-bold text-white mb-2">7 Revenue Drivers Scored</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Scores are computed across 7 critical conversion categories (SEO 20%, Speed 20%, Checkout & UX 20%, Products 15%, Trust 10%, Content 10%, Health 5%).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm mb-4">
            03
          </div>
          <h3 className="text-base font-bold text-white mb-2">Prioritized Roadmap & Code</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI evaluates only verified store findings to produce an actionable 30-day growth roadmap with exact, copy-paste code snippets for Shopify, WooCommerce, or Custom stores.
          </p>
        </div>
      </div>

      {/* Scoring Weight Breakdown Table */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Audit Scoring Dimensions & Impact</h2>
            <p className="text-xs text-slate-400 mt-1">
              Every score directly correlates with buyer conversion, search ranking, and checkout completion.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full shrink-0">
            100% Measured Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Audit Category</th>
                <th className="pb-3 font-semibold">Score Weight</th>
                <th className="pb-3 font-semibold">What We Inspect & Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="py-3.5 font-bold text-white">Technical & On-Page SEO</td>
                <td className="py-3.5 font-mono font-bold text-indigo-400">20%</td>
                <td className="py-3.5 text-slate-300">Page titles, Meta descriptions, Canonical URLs, Sitemaps, Robots.txt, and Heading hierarchy for Google rankings.</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">Speed & Core Web Vitals</td>
                <td className="py-3.5 font-mono font-bold text-indigo-400">20%</td>
                <td className="py-3.5 text-slate-300">Largest Contentful Paint (LCP), INP, CLS, uncompressed images, and scripts that cause mobile shoppers to bounce.</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">UX & Checkout Funnels</td>
                <td className="py-3.5 font-mono font-bold text-indigo-400">20%</td>
                <td className="py-3.5 text-slate-300">Mobile viewport responsiveness, prominent Add to Cart buttons, search visibility, and checkout drop-off triggers.</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">Product Page Optimization</td>
                <td className="py-3.5 font-mono font-bold text-indigo-400">15%</td>
                <td className="py-3.5 text-slate-300">Google Shopping JSON-LD schema, product variant selectors, high-res photos, pricing clarity, and customer reviews.</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">Store Trust & Security</td>
                <td className="py-3.5 font-mono font-bold text-indigo-400">10%</td>
                <td className="py-3.5 text-slate-300">Bulletproof SSL encryption, security response headers, clear refund/shipping policies, and contact information.</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">Content Quality</td>
                <td className="py-3.5 font-mono font-bold text-indigo-400">10%</td>
                <td className="py-3.5 text-slate-300">Word count adequacy, image alt attributes, duplicate copy, and keyword placement.</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">Technical Website Health</td>
                <td className="py-3.5 font-mono font-bold text-indigo-400">5%</td>
                <td className="py-3.5 text-slate-300">Server response codes, redirect chains, 404 broken links, and mixed content warnings.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => onOpenAuth('signup')}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all cursor-pointer"
        >
          Create Free Account & Run First Audit
        </button>
      </div>
    </div>
  );
};
