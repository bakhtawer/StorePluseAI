import React, { useState } from 'react';
import {
  Search,
  Store,
  CheckSquare,
  Activity,
  ArrowRight,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Filter,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { UrlAnalyzerBar, generateClientDynamicReport } from '../audit/UrlAnalyzerBar.tsx';
import { AuditReportView } from '../audit/AuditReportView.tsx';
import { AuditReportData } from '../../../server/analyzer.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

export const AuditsPlaceholderView: React.FC<{
  onNavigateToBilling: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
}> = ({ onNavigateToBilling, onOpenAuth = () => {}, isAuthenticated = false }) => {
  const [activeReport, setActiveReport] = useState<AuditReportData | null>(null);
  const { activePlan, activePlanId } = useAuth();

  if (activeReport) {
    return (
      <AuditReportView
        report={activeReport}
        onNewAudit={() => setActiveReport(null)}
        onOpenAuth={onOpenAuth}
        onNavigateToPlans={onNavigateToBilling}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  const sampleAudits = [
    {
      domain: 'store.gymshark.com',
      platform: 'Shopify',
      score: 84,
      date: '2 hours ago',
      pages: 1,
      critical: 2,
    },
    {
      domain: 'allbirds.com',
      platform: 'Shopify',
      score: 79,
      date: 'Yesterday',
      pages: 1,
      critical: 4,
    },
    {
      domain: 'artisan-goods.demo.com',
      platform: 'WooCommerce',
      score: 72,
      date: '3 days ago',
      pages: 1,
      critical: 6,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">
            <span>Audit Intelligence</span>
            <span>·</span>
            <span>Deterministic E-Commerce Diagnostics</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Audits & Reports</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Analyze online stores, generate comprehensive health audits, view platform remediation code snippets, and export client-ready reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            Active Tier: <strong className="text-indigo-400 capitalize">{activePlan.name}</strong>
          </span>
        </div>
      </div>

      {/* Real Interactive Analyzer Bar */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h3 className="text-base font-bold text-white">Run a New Storefront Audit</h3>
          <p className="text-xs text-slate-400">
            Paste any e-commerce URL. Our engine crawls the storefront, computes 7 core category scores, and delivers copy-paste platform fixes.
          </p>
        </div>

        <UrlAnalyzerBar onReportGenerated={(rep) => setActiveReport(rep)} />
      </div>

      {/* Saved Audits Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Saved Diagnostic Audits</span>
            </h3>
            <p className="text-[11px] text-slate-400">Historical crawl data and platform reports</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {sampleAudits.length} stored reports
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {sampleAudits.map((item, idx) => (
            <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl font-mono font-bold text-sm flex items-center justify-center shrink-0 border ${
                    item.score >= 80
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                      : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                  }`}
                >
                  {item.score}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>{item.domain}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700/60">
                      {item.platform}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Scanned {item.date} · {item.pages} page · {item.critical} critical findings
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  onClick={async () => {
                    const simulatedReport = await generateClientDynamicReport(`https://${item.domain}`);
                    setActiveReport(simulatedReport);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  View Full Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Limits Notice */}
      <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">
              Crawl Depth & Multi-Page Audit Quota: {activePlan.max_crawled_pages_per_audit} pages per audit
            </span>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              {activePlanId === 'free'
                ? 'Free plan inspects 1 storefront homepage. Upgrade to Starter or Growth to crawl up to 500 pages, unlock PDF reports, and enable automated monitoring.'
                : `Your ${activePlan.name} allows crawling up to ${activePlan.max_crawled_pages_per_audit} pages with ${activePlan.max_monthly_audits} monthly audit credits.`}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToBilling}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shrink-0 transition-colors cursor-pointer shadow-sm shadow-indigo-600/30"
        >
          {activePlanId === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
        </button>
      </div>
    </div>
  );
};

export const StoresPlaceholderView: React.FC = () => {
  const { activePlan, activePlanId } = useAuth();
  const hasStoreAccess = activePlan.max_connected_stores > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">
          <span>E-Commerce Integration</span>
          <span>·</span>
          <span>Shopify & WooCommerce REST API</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Connected Stores</h1>
        <p className="text-xs text-slate-400 mt-1">
          Connect your WooCommerce or Shopify stores to sync authorized sales, order volume, revenue health, and inventory turnover.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">
            {hasStoreAccess
              ? `${activePlan.max_connected_stores} Connected Store Slots Available`
              : 'Connected Stores Require Starter Plan or Above'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mt-1">
            {hasStoreAccess
              ? `Your active ${activePlan.name} includes ${activePlan.max_connected_stores} connected store integrations with encrypted credentials.`
              : 'Free plans include public URL diagnostics. Upgrade to connect authorized WooCommerce/Shopify store credentials.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={!hasStoreAccess}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect New Store (OAuth / Key)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ActionItemsPlaceholderView: React.FC = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Inject Schema.org Product Offer JSON-LD into theme.liquid',
      category: 'Technical SEO',
      platform: 'Shopify',
      impact: '+12% CTR',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Enable HTTP/2 Brotli compression on cloud server / CDN',
      category: 'Performance',
      platform: 'Server',
      impact: '-420ms Latency',
      status: 'in_progress',
    },
    {
      id: 3,
      title: 'Embed SSL Secure Checkout guarantees & Money-Back Badges on cart page',
      category: 'Trust Signals',
      platform: 'WooCommerce',
      impact: '+4.8% Checkout Conversion',
      status: 'resolved',
    },
    {
      id: 4,
      title: 'Preload Largest Contentful Paint hero banner image in HTML head',
      category: 'Performance',
      platform: 'Shopify',
      impact: '+18 LCP Score',
      status: 'pending',
    },
  ]);

  const toggle = (id: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const next =
            i.status === 'pending'
              ? 'in_progress'
              : i.status === 'in_progress'
              ? 'resolved'
              : 'pending';
          return { ...i, status: next };
        }
        return i;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">
            <span>Remediation Roadmap</span>
            <span>·</span>
            <span>Prioritized Task Execution</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Store Action Items</h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized issues extracted from storefront audits. Click any task to toggle status.
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
          {items.filter((i) => i.status === 'resolved').length}/{items.length} Completed
        </span>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        {items.map((task) => (
          <div
            key={task.id}
            onClick={() => toggle(task.id)}
            className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-4 ${
              task.status === 'resolved'
                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-1">
              <div
                className={`text-sm font-semibold ${
                  task.status === 'resolved' ? 'line-through text-slate-500' : 'text-slate-200'
                }`}
              >
                {task.title}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                <span>{task.category}</span>
                <span>·</span>
                <span className="text-indigo-400">{task.platform}</span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold">{task.impact}</span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded text-[10px] font-mono shrink-0 uppercase tracking-wider font-semibold ${
                task.status === 'resolved'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  : task.status === 'in_progress'
                  ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonitoringPlaceholderView: React.FC = () => {
  const { activePlan, activePlanId } = useAuth();
  const hasMonitoring = activePlan.can_run_monitoring;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">
          <span>Automated Health Sentinel</span>
          <span>·</span>
          <span>Continuous Verification</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Scheduled Store Monitoring</h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated continuous checks for website uptime, latency spikes, broken checkout buttons, and SEO metadata drift.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">
            {hasMonitoring
              ? 'Automated 24/7 Store Monitoring Active'
              : 'Continuous Monitoring Requires Growth Plan'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mt-1">
            {hasMonitoring
              ? `Your ${activePlan.name} includes scheduled recurring crawls every 24 hours with email alerts on speed regressions.`
              : 'Upgrade to Growth Plan ($49/mo) or above to unlock automated 24/7 storefront monitoring and alert notifications.'}
          </p>
        </div>
      </div>
    </div>
  );
};
