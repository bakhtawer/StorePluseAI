import React from 'react';
import {
  Search,
  Gauge,
  ShoppingCart,
  ShieldCheck,
  Check,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Zap,
  Layers,
  Database,
  BarChart3,
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
  const auditCategories = [
    {
      title: 'Technical & On-Page SEO',
      weight: '20% Score Weight',
      desc: 'Discover robots.txt, sitemaps, canonical tags, heading structure, duplicate metadata, and crawl indexability.',
      icon: Search,
    },
    {
      title: 'Performance & Core Web Vitals',
      weight: '20% Score Weight',
      desc: 'Evaluate Largest Contentful Paint (LCP), INP, CLS, render-blocking scripts, and asset compression.',
      icon: Gauge,
    },
    {
      title: 'UX & Conversion Optimization',
      weight: '20% Score Weight',
      desc: 'Analyze mobile responsiveness, navigation clarity, CTA placement, search accessibility, and purchase funnels.',
      icon: ShoppingCart,
    },
    {
      title: 'Product Page Intelligence',
      weight: '15% Score Weight',
      desc: 'Check product structured schema data, variant selectors, description completeness, review proof, and shipping terms.',
      icon: FileCheck,
    },
    {
      title: 'Website Trust & Security',
      weight: '10% Score Weight',
      desc: 'Audit SSL certificates, HTTPS redirects, security response headers, privacy policies, and return terms.',
      icon: ShieldCheck,
    },
    {
      title: 'Content Quality & Health',
      weight: '15% Score Weight',
      desc: 'Identify thin copy, missing image alt attributes, broken internal links, and technical 404/500 errors.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 mb-4 tracking-wide uppercase">
          <span>Deterministic Store Audits</span>
          <span>·</span>
          <span>Gemini AI Insights</span>
          <span>·</span>
          <span>WooCommerce & Shopify Ready</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          AI-Powered E-Commerce Growth & Store Intelligence
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          StorePulse AI provides comprehensive diagnostic audits for online stores. 
          Inspect technical SEO, performance, UX funnels, product pages, and trust signals with evidence-backed recommendations.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <span>Start Free Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm rounded-lg transition-colors"
          >
            Explore Methodology
          </button>
        </div>

        {/* Interactive Store Audit Bar */}
        <div className="mt-12">
          <UrlAnalyzerBar onReportGenerated={onReportGenerated} />
          <div className="mt-2 text-[11px] text-slate-500">
            Supports Shopify, WooCommerce, Magento, BigCommerce, OpenCart & Custom Platforms
          </div>
        </div>
      </section>

      {/* 6 Diagnostic Dimensions */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Deterministic, Evidence-Based Audit Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            StorePulse AI calculates deterministic store health scores based on measured technical data. 
            AI interprets findings to generate prioritized 30-day roadmaps and actionable solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {auditCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mb-1">{cat.weight}</div>
                  <h3 className="text-base font-bold text-white mb-2">{cat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commercial SaaS Architecture Highlights */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              SaaS Infrastructure
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise PostgreSQL & Row Level Security
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              Built on Supabase PostgreSQL with 20 normalized tables, tenant boundary isolation, 
              granular RBAC roles, and automated usage metering. Client data is strictly separated between organizations.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Multi-tenant Workspaces</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Strict RLS Policies</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Deterministic Scoring (v1.0)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Gemini AI Reporting Engine</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 w-full lg:w-80 font-mono text-xs text-slate-300 space-y-3">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Architecture Status
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database:</span>
              <span className="text-emerald-400">Supabase 15+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Migrations:</span>
              <span className="text-slate-200">2 Applied</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tables:</span>
              <span className="text-slate-200">20 Normalized</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RLS Enforcement:</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plans Seeded:</span>
              <span className="text-blue-400">5 Tiers</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Ready to diagnose your e-commerce store?
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Create your free account today and discover high-impact growth opportunities across SEO, performance, and conversion.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => onOpenAuth('signup')}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-600/30 transition-colors"
          >
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
};
