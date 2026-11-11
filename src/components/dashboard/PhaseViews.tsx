import React, { useState } from 'react';
import { Search, Store, CheckSquare, Activity, ArrowRight, Lock, ExternalLink } from 'lucide-react';
import { UrlAnalyzerBar } from '../audit/UrlAnalyzerBar.tsx';
import { AuditReportView } from '../audit/AuditReportView.tsx';
import { AuditReportData } from '../../../server/analyzer.ts';

export const AuditsPlaceholderView: React.FC<{
  onNavigateToBilling: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
}> = ({ onNavigateToBilling, onOpenAuth = () => {}, isAuthenticated = false }) => {
  const [activeReport, setActiveReport] = useState<AuditReportData | null>(null);

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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
          <span>Public Store Analyzer</span>
          <span>·</span>
          <span>Deterministic E-Commerce Audits</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Run Store Diagnostic Audit</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Enter any e-commerce storefront URL to immediately extract platform architecture, technical SEO health, 
          performance latency, product schema completeness, and buyer trust indicators.
        </p>
      </div>

      {/* Real Interactive Analyzer Bar */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-lg font-bold text-white">Analyze Any Online Store</h3>
          <p className="text-xs text-slate-400">
            Our engine inspects the storefront, evaluates 7 core dimensions, and delivers an exportable diagnostic report.
          </p>
        </div>

        <UrlAnalyzerBar onReportGenerated={(rep) => setActiveReport(rep)} />
      </div>

      {/* Plan Limits Notice */}
      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 flex items-start justify-between gap-4 text-xs">
        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Detailed Multi-Page Crawls & Connected Store Intelligence</span>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              Public scans inspect homepage signals. To crawl up to 2,000 pages, connect WooCommerce/Shopify sales data, and schedule 24/7 automated monitoring, upgrade your organization plan.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToBilling}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shrink-0 transition-colors"
        >
          View Plans
        </button>
      </div>
    </div>
  );
};

export const StoresPlaceholderView: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
        <span>Scheduled in Roadmap</span>
        <span>·</span>
        <span>Phase 6</span>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">Connected Stores (WooCommerce & Shopify)</h1>
      <p className="text-xs text-slate-400 mt-1">
        Connect authorized stores via REST API to pull real orders, revenue, inventory alerts, and product analytics.
      </p>
    </div>

    <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
        <Store className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white">Store Integrations Activate in Phase 6</h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
        PostgreSQL tables for <code>stores</code> and <code>store_integrations</code> with encrypted credentials are fully provisioned in the initial migration.
      </p>
    </div>
  </div>
);

export const ActionItemsPlaceholderView: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
        <span>Scheduled in Roadmap</span>
        <span>·</span>
        <span>Phase 5</span>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">Action Items & Remediations</h1>
      <p className="text-xs text-slate-400 mt-1">
        Convert audit findings into prioritized tasks, assign team members, and track completion progress.
      </p>
    </div>

    <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
        <CheckSquare className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white">Action Items Activate with Audit Reports (Phase 5)</h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
        The database table <code>action_items</code> with RLS policies is created and waiting for incoming findings.
      </p>
    </div>
  </div>
);

export const MonitoringPlaceholderView: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
        <span>Scheduled in Roadmap</span>
        <span>·</span>
        <span>Phase 7</span>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">Scheduled Store Monitoring</h1>
      <p className="text-xs text-slate-400 mt-1">
        Automated continuous monitoring for website uptime, broken links, speed regressions, and SEO metadata changes.
      </p>
    </div>

    <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
        <Activity className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white">Continuous Monitoring Framework (Phase 7)</h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
        Database tables <code>monitoring_jobs</code> and <code>monitoring_results</code> are ready in migration 1.
      </p>
    </div>
  </div>
);
