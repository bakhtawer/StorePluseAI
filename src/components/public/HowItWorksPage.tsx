import React from 'react';
import { ShieldAlert, Cpu, Gauge, Search, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC<{ onOpenAuth: (mode: 'login' | 'signup') => void }> = ({ onOpenAuth }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
          Engineering Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          How StorePulse AI Operates
        </h1>
        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
          StorePulse AI strictly distinguishes measured data from AI-generated interpretations. 
          No hallucinated traffic, fabricated conversion rates, or arbitrary score generation.
        </p>
      </div>

      {/* 3 Steps Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-sm mb-3">
            01
          </div>
          <h3 className="text-base font-bold text-white mb-2">SSRF-Protected Crawling</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Crawls public pages within plan depth limits. Blocks localhost, link-local, private IPs, cloud metadata, and respects robots.txt directives.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-3">
            02
          </div>
          <h3 className="text-base font-bold text-white mb-2">Deterministic Scoring Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scores are calculated via strict backend algorithms (Technical SEO 20%, Performance 20%, UX 20%, Product 15%, Trust 10%, Content 10%, Health 5%).
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-sm mb-3">
            03
          </div>
          <h3 className="text-base font-bold text-white mb-2">Gemini AI Synthesis</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI only processes verified audit findings to produce structured JSON executive summaries, quick wins, and 30-day tactical roadmaps.
          </p>
        </div>
      </div>

      {/* Scoring Weight Breakdown Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-4">Official Scoring Weights (v1.0.0)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3">Audit Category</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Observable Evidence Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="py-3 font-semibold text-white">Technical SEO</td>
                <td className="py-3 font-mono text-blue-400">20%</td>
                <td className="py-3 text-slate-400">Titles, Meta descriptions, Canonical links, Sitemaps, Robots.txt, Heading hierarchy</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Performance</td>
                <td className="py-3 font-mono text-blue-400">20%</td>
                <td className="py-3 text-slate-400">PageSpeed API (LCP, INP, CLS, FCP), asset weight, render blocking scripts</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">UX & Conversion</td>
                <td className="py-3 font-mono text-blue-400">20%</td>
                <td className="py-3 text-slate-400">Mobile viewport, clear navigation, CTA placement, search accessibility, cart visibility</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Product Optimization</td>
                <td className="py-3 font-mono text-blue-400">15%</td>
                <td className="py-3 text-slate-400">Product schema, variant info, high-res images, pricing clarity, reviews visibility</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Trust Signals</td>
                <td className="py-3 font-mono text-blue-400">10%</td>
                <td className="py-3 text-slate-400">HTTPS enforcement, security headers, privacy policy, terms, contact information</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Content Quality</td>
                <td className="py-3 font-mono text-blue-400">10%</td>
                <td className="py-3 text-slate-400">Word count adequacy, image alt tags, duplicate copy, keyword dilution</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Technical Health</td>
                <td className="py-3 font-mono text-blue-400">5%</td>
                <td className="py-3 text-slate-400">HTTP status codes, redirect chains, 404 broken links, mixed content</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => onOpenAuth('signup')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm shadow-blue-600/30 transition-colors"
        >
          Create Free Account to Run First Audit
        </button>
      </div>
    </div>
  );
};
