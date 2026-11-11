import React, { useState } from 'react';
import { AuditReportData } from '../../../server/analyzer.ts';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Gauge,
  ShoppingCart,
  FileCheck,
  BarChart3,
  Download,
  Printer,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Lock,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Share2,
} from 'lucide-react';

interface AuditReportViewProps {
  report: AuditReportData;
  onNewAudit: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onNavigateToPlans: () => void;
  isAuthenticated: boolean;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  report,
  onNewAudit,
  onOpenAuth,
  onNavigateToPlans,
  isAuthenticated,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Filter findings
  const filteredFindings = report.findings.filter((f) => {
    const matchCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchSev = selectedSeverity === 'all' || f.severity === selectedSeverity;
    return matchCat && matchSev;
  });

  const criticalCount = report.findings.filter((f) => f.severity === 'critical').length;
  const highCount = report.findings.filter((f) => f.severity === 'high').length;
  const mediumCount = report.findings.filter((f) => f.severity === 'medium').length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storepulse-audit-${report.normalized_domain}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const text = `StorePulse AI Audit Report for ${report.normalized_domain}\nOverall Health Score: ${report.overall_score}/100\nPlatform: ${report.detected_platform.platform.toUpperCase()} (${Math.round(report.detected_platform.confidence * 100)}%)\n\nExecutive Summary:\n${report.executive_summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4 print:p-0 print:m-0 print:max-w-none print:text-black">
      {/* Top Controls Strip (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <button
          onClick={onNewAudit}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Analyze Another Store</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Summary Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:border-none print:bg-white print:text-black print:p-0">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="font-mono text-slate-400 print:text-gray-600">Initial Store Analysis</span>
            <span className="text-slate-600 print:text-gray-400">·</span>
            <span className="text-slate-400 print:text-gray-600">
              {new Date(report.analyzed_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-slate-600 print:text-gray-400">·</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-blue-600/20 text-blue-400 border border-blue-500/30 print:border-gray-400 print:text-black">
              {report.detected_platform.platform} ({Math.round(report.detected_platform.confidence * 100)}% Match)
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3 print:text-black">
            <span>{report.normalized_domain}</span>
            <a
              href={report.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-blue-400 print:hidden"
              title="Open website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl print:text-gray-600">
            Target URL: <code className="text-slate-300 font-mono text-[11px] print:text-black">{report.target_url}</code>
            {report.detected_platform.evidence.length > 0 && (
              <span className="block mt-1 text-[11px] text-slate-500 print:text-gray-500">
                Evidence: {report.detected_platform.evidence.join('; ')}
              </span>
            )}
          </p>
        </div>

        {/* Big Overall Health Score Badge */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 print:border print:border-gray-300 print:bg-gray-50">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-gray-600">
              Store Health Score
            </div>
            <div className="text-xs text-slate-500 mt-0.5 print:text-gray-600">Deterministic v1.0</div>
          </div>
          <div
            className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center font-mono font-black ${getScoreColor(
              report.overall_score
            )}`}
          >
            <span className="text-2xl leading-none">{report.overall_score}</span>
            <span className="text-[9px] uppercase tracking-wider font-sans font-bold mt-1">/ 100</span>
          </div>
        </div>
      </div>

      {/* 7 Category Score Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 print:text-black">
          Deterministic Category Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { label: 'Technical SEO', score: report.category_scores.technical_seo, weight: '20%', icon: Search },
            { label: 'Performance', score: report.category_scores.performance, weight: '20%', icon: Gauge },
            { label: 'UX & Funnel', score: report.category_scores.ux_conversion, weight: '20%', icon: ShoppingCart },
            { label: 'Product Schema', score: report.category_scores.product_optimization, weight: '15%', icon: FileCheck },
            { label: 'Trust Signals', score: report.category_scores.trust_signals, weight: '10%', icon: ShieldCheck },
            { label: 'Content Health', score: report.category_scores.content_quality, weight: '10%', icon: BarChart3 },
            { label: 'Tech Health', score: report.category_scores.technical_health, weight: '5%', icon: ShieldAlert },
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between print:bg-white print:border-gray-300"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2 print:text-gray-500">
                    <Icon className="w-4 h-4 text-slate-400 print:text-gray-600" />
                    <span className="text-[10px] font-mono">{cat.weight}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate print:text-black">{cat.label}</div>
                </div>
                <div className="mt-3 flex items-baseline justify-between font-mono">
                  <span className={`text-lg font-bold ${getScoreColor(cat.score).split(' ')[0]}`}>{cat.score}</span>
                  <span className="text-[10px] text-slate-500 print:text-gray-500">/100</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2 print:text-black">
          Executive Summary
        </h2>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed print:text-gray-800">
          {report.executive_summary}
        </p>

        {/* Quick Diagnostics Counters */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono print:border-gray-300">
          <div>
            <span className="text-slate-500 block text-[10px]">Response Latency:</span>
            <span className="text-slate-200 font-semibold print:text-black">{report.metrics.response_time_ms} ms</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">HTML Payload:</span>
            <span className="text-slate-200 font-semibold print:text-black">{report.metrics.html_size_kb} KB</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Images Lacking Alt:</span>
            <span className="text-slate-200 font-semibold print:text-black">
              {report.metrics.missing_alt_images} of {report.metrics.total_images}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">HTTPS Protected:</span>
            <span className={`font-semibold ${report.metrics.is_https ? 'text-emerald-400' : 'text-rose-400'}`}>
              {report.metrics.is_https ? 'Enforced' : 'Insecure HTTP'}
            </span>
          </div>
        </div>
      </div>

      {/* 5 High-Impact Quick Wins */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider print:text-black">
            5 High-Impact Quick Wins
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.quick_wins.map((win, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 print:bg-gray-50 print:border-gray-300 print:text-black"
            >
              <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                {idx + 1}
              </div>
              <span className="leading-snug">{win}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED ONGOING ISSUE RESOLVING GATE BANNER (User Request Requirement) */}
      {/* ========================================================================= */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-blue-500/40 shadow-xl print:border-gray-300 print:bg-gray-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 text-[11px] font-semibold border border-blue-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>Detailed Multi-Page Auditing & Continuous Issue Resolving</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight print:text-black">
              Resolve Issues Continuously & Crawl Up to 2,000 Pages
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed print:text-gray-700">
              This initial diagnostic report inspected your storefront homepage. To run full deep crawls (100 to 2,000 pages), 
              track automated remediation tasks, connect WooCommerce or Shopify for revenue insights, and activate continuous 24/7 monitoring, 
              please sign in and follow the StorePulse subscription plans.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-300 print:text-gray-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Page Depth (100 – 2,000 pages)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated 24/7 Availability & Speed Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WooCommerce & Shopify Order Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interactive AI Assistant for Fixes</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto print:hidden">
            {!isAuthenticated ? (
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-600/30 transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              onClick={onNavigateToPlans}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Subscription Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Granular Audit Findings Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800 print:border-gray-300">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight print:text-black">
              Measured Audit Findings ({filteredFindings.length} of {report.findings.length})
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Each finding is backed by measured HTTP evidence and actionable technical remediation.
            </p>
          </div>

          {/* Filters (Hidden in Print) */}
          <div className="flex flex-wrap items-center gap-2 print:hidden text-xs">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical ({criticalCount})</option>
              <option value="high">High ({highCount})</option>
              <option value="medium">Medium ({mediumCount})</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="technical_seo">Technical SEO</option>
              <option value="performance">Performance</option>
              <option value="ux_conversion">UX & Conversion</option>
              <option value="product_optimization">Product Optimization</option>
              <option value="trust_signals">Trust & Security</option>
            </select>
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-3 print:bg-white print:border-gray-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      finding.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 print:text-red-700'
                        : finding.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 print:text-amber-700'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 print:text-blue-700'
                    }`}
                  >
                    {finding.severity}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 uppercase print:text-gray-500">
                    {finding.category.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 print:text-gray-600">Measured Evidence</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white print:text-black">{finding.issue_name}</h3>
                <div className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 break-all print:bg-gray-100 print:text-gray-900 print:border-gray-300">
                  <strong className="text-slate-300 print:text-black">Observed Evidence:</strong> {finding.evidence}
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 print:text-gray-800">
                <div>
                  <strong className="text-slate-400 font-semibold print:text-black">Impact:</strong> {finding.explanation}
                </div>
                <div>
                  <strong className="text-emerald-400 font-semibold print:text-emerald-800">Recommended Solution:</strong>{' '}
                  {finding.recommended_solution}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30-Day Tactical Roadmap */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 print:bg-white print:border-gray-300">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wider print:text-black">
            <Calendar className="w-3.5 h-3.5" />
            <span>Implementation Framework</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight print:text-black">
            30-Day Prioritized Improvement Roadmap
          </h2>
          <p className="text-xs text-slate-400 print:text-gray-600">
            Follow this chronological phased sequence to resolve critical blockers first and maximize conversion ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.thirty_day_roadmap.map((week, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 print:bg-gray-50 print:border-gray-300"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-400 print:text-blue-800">{week.week}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 print:text-gray-600">
                  {week.impact} Impact
                </span>
              </div>
              <h4 className="text-xs font-bold text-white print:text-black">{week.title}</h4>
              <ul className="space-y-1 text-xs text-slate-300 print:text-gray-800">
                {week.tasks.map((task, tidx) => (
                  <li key={tidx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold shrink-0">·</span>
                    <span className="text-[11px] leading-tight">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
