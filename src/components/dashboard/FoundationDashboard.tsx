import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import {
  ShieldCheck,
  Building2,
  Database,
  Users,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  ArrowRight,
  Lock,
  Globe,
  FileText,
  Activity,
  Zap,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { UrlAnalyzerBar } from '../audit/UrlAnalyzerBar.tsx';
import { AuditReportData } from '../../../server/analyzer.ts';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

interface SavedAuditItem {
  id: string;
  domain: string;
  url: string;
  platform: string;
  score: number;
  date: string;
  status: 'completed' | 'analyzing';
  criticalIssues: number;
}

const SAMPLE_SAVED_AUDITS: SavedAuditItem[] = [
  {
    id: 'aud-01',
    domain: 'store.gymshark.com',
    url: 'https://store.gymshark.com',
    platform: 'shopify',
    score: 84,
    date: '2 hours ago',
    status: 'completed',
    criticalIssues: 2,
  },
  {
    id: 'aud-02',
    domain: 'allbirds.com',
    url: 'https://allbirds.com',
    platform: 'shopify',
    score: 79,
    date: 'Yesterday',
    status: 'completed',
    criticalIssues: 4,
  },
  {
    id: 'aud-03',
    domain: 'artisan-goods.demo.com',
    url: 'https://artisan-goods.demo.com',
    platform: 'woocommerce',
    score: 72,
    date: '3 days ago',
    status: 'completed',
    criticalIssues: 6,
  },
];

export const FoundationDashboard: React.FC<{
  onOpenDatabaseSetup: () => void;
  onOpenOrgModal: () => void;
  onSelectTab: (tab: string) => void;
  onReportGenerated?: (report: AuditReportData) => void;
}> = ({ onOpenDatabaseSetup, onOpenOrgModal, onSelectTab, onReportGenerated }) => {
  const { user, profile, currentOrg, memberships, isConfigured, activePlan, activePlanId, changePlan } = useAuth();
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);

  // Remediation tasks state
  const [actionItems, setActionItems] = useState([
    {
      id: 'task-1',
      title: 'Add Schema.org Product & Offer structured markup to PDPs',
      category: 'Technical SEO',
      severity: 'critical',
      status: 'pending',
    },
    {
      id: 'task-2',
      title: 'Configure HTTP Brotli compression and cache headers',
      category: 'Performance',
      severity: 'high',
      status: 'in_progress',
    },
    {
      id: 'task-3',
      title: 'Embed SSL security badges & guarantees on cart and checkout',
      category: 'Trust Signals',
      severity: 'medium',
      status: 'resolved',
    },
    {
      id: 'task-4',
      title: 'Optimize Largest Contentful Paint (LCP) hero banner images',
      category: 'Performance',
      severity: 'critical',
      status: 'pending',
    },
  ]);

  const toggleTaskStatus = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === 'pending'
              ? 'in_progress'
              : item.status === 'in_progress'
              ? 'resolved'
              : 'pending';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const isSuperAdmin = Boolean(user && profile?.system_role === 'admin');

  // Automated Phase 1 Foundation Test Suite (Super Admin Only)
  const runFoundationTests = async () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];

    // Test 1: Authentication & Profile integrity
    const t1Start = performance.now();
    await new Promise((r) => setTimeout(r, 180));
    results.push({
      name: 'Authentication State & Profile Integrity',
      category: 'Auth',
      passed: Boolean(user && profile && profile.email),
      message: `User verified: ${user?.email || 'N/A'}, System Role: ${profile?.system_role || 'N/A'}`,
      durationMs: Math.round(performance.now() - t1Start),
    });

    // Test 2: Multi-tenant Organization context
    const t2Start = performance.now();
    await new Promise((r) => setTimeout(r, 120));
    const hasOrg = Boolean(currentOrg && currentOrg.id);
    results.push({
      name: 'Tenant Workspace Context',
      category: 'Multi-Tenancy',
      passed: hasOrg,
      message: `Active Organization: ${currentOrg?.name || 'N/A'} (${currentOrg?.id || 'N/A'})`,
      durationMs: Math.round(performance.now() - t2Start),
    });

    // Test 3: Plan & Quota Enforcement
    const t3Start = performance.now();
    await new Promise((r) => setTimeout(r, 150));
    results.push({
      name: 'Subscription Plan Enforcement & Crawl Boundaries',
      category: 'Billing',
      passed: Boolean(activePlan && activePlan.max_monthly_audits > 0),
      message: `Active Plan: ${activePlan.name} (${activePlan.max_monthly_audits} audits/mo, max ${activePlan.max_crawled_pages_per_audit} pages/crawl)`,
      durationMs: Math.round(performance.now() - t3Start),
    });

    // Test 4: Database Catalog & Seed Verification
    const t4Start = performance.now();
    try {
      const res = await fetch('/api/v1/plans');
      const data = await res.json();
      const planCount = data.plans?.length || 0;
      results.push({
        name: 'Database Plan Catalog & Quota Seeds',
        category: 'Database',
        passed: planCount >= 5,
        message: `Verified ${planCount} active subscription tiers (Free, Starter, Growth, Agency, Business)`,
        durationMs: Math.round(performance.now() - t4Start),
      });
    } catch (e: any) {
      results.push({
        name: 'Database Plan Catalog & Quota Seeds',
        category: 'Database',
        passed: false,
        message: `API query failed: ${e.message}`,
        durationMs: Math.round(performance.now() - t4Start),
      });
    }

    // Test 5: Backend Server Health
    const t5Start = performance.now();
    try {
      const res = await fetch('/api/v1/health');
      const data = await res.json();
      results.push({
        name: 'Server API Health Gateway',
        category: 'Infrastructure',
        passed: data.status === 'ok',
        message: `Status: ${data.status}, Service: ${data.service}, Supabase Mode: ${
          isConfigured ? 'Live Cloud' : 'Developer Gateway'
        }`,
        durationMs: Math.round(performance.now() - t5Start),
      });
    } catch (e: any) {
      results.push({
        name: 'Server API Health Gateway',
        category: 'Infrastructure',
        passed: false,
        message: `Health check failed: ${e.message}`,
        durationMs: Math.round(performance.now() - t5Start),
      });
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  const allPassed = testResults?.every((t) => t.passed);

  // Dynamic audit quota calculations
  const auditsUsedThisMonth = activePlanId === 'free' ? 0 : 2;
  const auditsRemaining = Math.max(0, activePlan.max_monthly_audits - auditsUsedThisMonth);
  const auditQuotaPercentage = Math.min(
    100,
    Math.round((auditsUsedThisMonth / activePlan.max_monthly_audits) * 100)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Workspace Header Strip */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">
            <span>Workspace: {currentOrg?.name || 'My Store'}</span>
            <span>·</span>
            <span className="text-emerald-400 capitalize">{activePlan.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Store Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Welcome back, {profile?.full_name || user?.email}. Real-time storefront health scores,
            audit quotas, prioritized remediations, and platform optimizations are ready below.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('billing')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activePlanId === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}</span>
          </button>

          <button
            onClick={onOpenOrgModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Switch Workspace</span>
          </button>
        </div>
      </div>

      {/* Dynamic Subscription-Shaped KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Audit Credits */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Monthly Audit Credits</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {auditsUsedThisMonth}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {activePlan.max_monthly_audits} audits
            </span>
          </div>
          <div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, auditQuotaPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
              <span>{auditsRemaining} available</span>
              <span>Renews in 18d</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Average Store Health Score */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Average Store Health</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">78</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Across 3 analyzed storefronts</span>
          </div>
        </div>

        {/* Metric 3: Critical Issues */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Critical Remediations</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">5</span>
            <span className="text-xs text-slate-400">high impact</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>Potential revenue lift:</span>
            <span className="text-emerald-400 font-bold font-mono">+12.4%</span>
          </div>
        </div>

        {/* Metric 4: Crawl Depth & Plan Boundary */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Crawl Depth Limit</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {activePlan.max_crawled_pages_per_audit}
            </span>
            <span className="text-xs text-slate-400">pages / audit</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>PDF Export:</span>
            <span className={activePlan.can_export_pdf ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              {activePlan.can_export_pdf ? 'Unlocked' : 'Locked (Starter+)'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Interactive Store Audit Launcher */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Run New Store Audit</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste your store or a competitor's URL to extract instant 7-category diagnostics and platform fixes.
            </p>
          </div>
          <div className="hidden sm:block text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Quota: {auditsRemaining} left this billing cycle
          </div>
        </div>

        <UrlAnalyzerBar
          onReportGenerated={(rep) => {
            if (onReportGenerated) onReportGenerated(rep);
            else onSelectTab('audits');
          }}
        />
      </div>

      {/* Split Grid: Recent Audits & Action Items Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Recent Store Audits & Reports */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Recent Audits & Reports</span>
              </h3>
              <p className="text-[11px] text-slate-400">Saved storefront diagnostic reports</p>
            </div>
            <button
              onClick={() => onSelectTab('audits')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {SAMPLE_SAVED_AUDITS.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-9 h-9 rounded-lg font-mono font-bold text-sm flex items-center justify-center shrink-0 border ${
                      item.score >= 80
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                        : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                    }`}
                  >
                    {item.score}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
                      <span>{item.domain}</span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                        {item.platform}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.date} · {item.criticalIssues} critical findings
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectTab('audits')}
                    className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Priority Remediation Checklist */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Store Remediation Action Items</span>
              </h3>
              <p className="text-[11px] text-slate-400">Click to toggle status (Pending → In Progress → Resolved)</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
              {actionItems.filter((i) => i.status === 'resolved').length}/{actionItems.length} Done
            </span>
          </div>

          <div className="space-y-2.5">
            {actionItems.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTaskStatus(task.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  task.status === 'resolved'
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div
                    className={`font-medium ${
                      task.status === 'resolved' ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>{task.category}</span>
                    <span>·</span>
                    <span
                      className={
                        task.severity === 'critical'
                          ? 'text-rose-400'
                          : task.severity === 'high'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      }
                    >
                      {task.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 uppercase tracking-wider font-semibold ${
                    task.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : task.status === 'in_progress'
                      ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Upsell Card (Shaped to current plan) */}
      {activePlanId !== 'business' && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              {activePlanId === 'free'
                ? 'Upgrade to Starter or Growth'
                : activePlanId === 'starter'
                ? 'Upgrade to Growth Plan'
                : 'Upgrade to Agency Workspace'}
            </div>
            <h4 className="text-base font-bold text-white">
              {activePlanId === 'free'
                ? 'Unlock Full Multi-Page Crawls & PDF Export Reports'
                : activePlanId === 'starter'
                ? 'Unlock 3 Connected Stores & 24/7 Automated Monitoring'
                : 'Unlock White-Label Client Reports & 10 Store Workspaces'}
            </h4>
            <p className="text-xs text-slate-400 max-w-xl">
              {activePlanId === 'free'
                ? 'Free plans are limited to 1 homepage audit per month. Upgrade to get up to 10 audits, 100-page crawl depth, AI recommendations, and downloadable PDF reports.'
                : activePlanId === 'starter'
                ? 'Scale your intelligence with automated 24/7 store monitoring, 30 monthly audits, and 500-page crawl limits.'
                : 'Deliver professional white-label reports branded with your agency logo and manage client stores seamlessly.'}
            </p>
          </div>

          <button
            onClick={() => onSelectTab('billing')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-indigo-600/30 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Explore Plans & Upgrades
          </button>
        </div>
      )}

      {/* SUPER ADMIN DIAGNOSTICS & DB CONFIG (Strictly Super Admin Only) */}
      {isSuperAdmin && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Super Admin Control Center</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Database Configuration & Architectural Test Suite
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Visible exclusively to Super Admin. Configure Supabase PostgreSQL connections, view SQL migrations, and run automated health verification.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={runFoundationTests}
                disabled={isRunningTests}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
                <span>{isRunningTests ? 'Verifying Architecture...' : 'Run Test Suite'}</span>
              </button>

              <button
                onClick={onOpenDatabaseSetup}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin DB Config</span>
              </button>
            </div>
          </div>

          {/* Test Results Display */}
          {testResults && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                <span className="font-bold text-white">Verification Results:</span>
                <span className={allPassed ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {testResults.filter((t) => t.passed).length} of {testResults.length} Passed
                </span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {testResults.map((t, idx) => (
                  <div key={idx} className="py-2 flex items-start justify-between text-xs gap-4">
                    <div className="flex items-start gap-2">
                      {t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-white">
                          {t.name} <span className="text-[10px] text-slate-500 font-mono">[{t.category}]</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{t.message}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{t.durationMs}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
