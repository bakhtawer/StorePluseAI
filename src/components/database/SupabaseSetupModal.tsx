import React, { useState, useEffect } from 'react';
import { checkSupabaseConnection, SupabaseConfigStatus } from '../../lib/supabase.ts';
import { X, Database, CheckCircle2, AlertCircle, Copy, Check, Terminal, ExternalLink, RefreshCw } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<SupabaseConfigStatus | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'env' | 'schema' | 'rls'>('status');

  const runCheck = async () => {
    setTesting(true);
    const res = await checkSupabaseConnection();
    setStatus(res);
    setTesting(false);
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const envTemplate = `# Add these to your .env file in the root directory:
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Supabase PostgreSQL Integration</h2>
              <p className="text-xs text-slate-400">Database architecture, schema status, and connection controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 my-4 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'status' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'env' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Environment Keys
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'schema' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            SQL Migration
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'rls' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            RLS Security Rules
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-start justify-between ${
                  status?.connectionStatus === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {status?.connectionStatus === 'connected' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-sm text-white">
                      {status?.connectionStatus === 'connected'
                        ? 'Supabase Database Connected & Ready'
                        : 'Local Development / Awaiting Supabase Credentials'}
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      {status?.connectionStatus === 'connected'
                        ? 'Full production database active. Tables, RLS, and Auth are authenticated with Supabase.'
                        : 'StorePulse AI is currently utilizing the built-in local development session engine. To connect your live Supabase cloud project, configure your API keys below.'}
                    </div>
                    {status?.errorMessage && (
                      <div className="mt-2 text-[11px] font-mono text-amber-300 bg-black/40 p-2 rounded">
                        Details: {status.errorMessage}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={runCheck}
                  disabled={testing}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>

              {/* Status details checklist */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="text-slate-400 font-medium mb-1">PostgreSQL Database</div>
                  <div className="font-semibold text-white">Supabase PostgreSQL 15+</div>
                  <div className="text-[11px] text-slate-500 mt-1">20 Tables + Foreign Keys</div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="text-slate-400 font-medium mb-1">Security Isolation</div>
                  <div className="font-semibold text-white">Row Level Security (RLS)</div>
                  <div className="text-[11px] text-slate-500 mt-1">Multi-tenant Organization Boundary</div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="text-slate-400 font-medium mb-1">Authentication</div>
                  <div className="font-semibold text-white">Supabase Auth (JWT)</div>
                  <div className="text-[11px] text-slate-500 mt-1">Email, Password, Auto-provisioning</div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="text-slate-400 font-medium mb-1">Pricing & Plans Seeded</div>
                  <div className="font-semibold text-emerald-400">5 Tier Plans Configured</div>
                  <div className="text-[11px] text-slate-500 mt-1">Free, Starter, Growth, Agency, Business</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-3">
              <p className="text-slate-300">
                To connect your live Supabase cloud project, locate your API keys in your Supabase Dashboard under{' '}
                <strong className="text-white">Project Settings &rarr; API</strong> and add them to your environment:
              </p>

              <div className="relative">
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {envTemplate}
                </pre>
                <button
                  onClick={() => copyToClipboard(envTemplate, 'env')}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1"
                >
                  {copiedTab === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTab === 'env' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2">
                <Terminal className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <span>
                  The server automatically detects keys from either <code>process.env</code> or the local <code>.env</code> file.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Migration: 20261110000001_initial_schema.sql</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `-- Open supabase/migrations/20261110000001_initial_schema.sql to view or run in Supabase SQL editor`,
                      'schema'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1"
                >
                  {copiedTab === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SQL</span>
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                File location: <code>supabase/migrations/20261110000001_initial_schema.sql</code>. Contains all 20 normalized tables with primary keys, indexes, triggers, and plan seeds.
              </p>
            </div>
          )}

          {activeTab === 'rls' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Migration: 20261110000002_rls_policies.sql</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `-- Open supabase/migrations/20261110000002_rls_policies.sql to view or run in Supabase SQL editor`,
                      'rls'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1"
                >
                  {copiedTab === 'rls' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SQL</span>
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                File location: <code>supabase/migrations/20261110000002_rls_policies.sql</code>. Configures Row Level Security on every table, multi-tenant organization tenancy rules, and signup onboarding triggers.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            StorePulse AI &middot; Architecture Phase 1
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
