import React, { useState, useEffect } from 'react';
import { checkSupabaseConnection, SupabaseConfigStatus } from '../../lib/supabase.ts';
import { X, Database, CheckCircle2, AlertCircle, Copy, Check, Terminal, ExternalLink, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'status' | 'guide' | 'env' | 'schema' | 'rls'>('guide');
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [rlsSql, setRlsSql] = useState<string>('');

  const runCheck = async () => {
    setTesting(true);
    const res = await checkSupabaseConnection();
    setStatus(res);
    setTesting(false);
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();

      // Fetch SQL migration contents
      fetch('/api/v1/admin/migrations/schema')
        .then((r) => r.json())
        .then((d) => {
          if (d.sql) setSchemaSql(d.sql);
        })
        .catch(() => {});

      fetch('/api/v1/admin/migrations/rls')
        .then((r) => r.json())
        .then((d) => {
          if (d.sql) setRlsSql(d.sql);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const envTemplate = `# 1. Go to your Supabase Project > Project Settings > API
# 2. Paste your project values below into .env (or AI Studio Secrets):

VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Super Admin: Connect Supabase Database</h2>
              <p className="text-xs text-slate-400">PostgreSQL migrations, issue solution tables, and connection setup</p>
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
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'guide' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Connection Guide
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'status' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Status Test
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'env' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'schema' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            SQL Schema
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors ${
              activeTab === 'rls' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            RLS Policies
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4">
          {activeTab === 'guide' && (
            <div className="space-y-4 text-slate-300">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-slate-200">
                <div className="font-bold text-white mb-1">How to connect your Supabase database to show people:</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  Follow these 4 simple steps to connect StorePulse AI directly to your live Supabase project. 
                  Once connected, all user accounts, organization workspaces, store audits, and detailed solutions are saved directly to your PostgreSQL database.
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Create a Project on Supabase</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a>, sign in, and click <strong>New Project</strong>. Choose any organization and password.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Run the SQL Migration in SQL Editor</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    In your Supabase project, click <strong>SQL Editor</strong> on the left. Click the <strong>SQL Schema</strong> tab above, copy the SQL, paste it in Supabase, and click <strong>Run</strong>. Then repeat for the <strong>RLS Policies</strong> tab.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Copy Project API Keys</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    In Supabase, go to <strong>Project Settings &rarr; API</strong>. Copy your <strong>Project URL</strong>, <strong>anon public</strong> key, and <strong>service_role</strong> secret key.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>Set Environment Variables & Test</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Add the keys to your <code>.env</code> file (or AI Studio Secrets panel). Then click <strong>Status Test</strong> above and click <strong>Test Connection</strong>. The indicator will turn green!
                  </p>
                </div>
              </div>
            </div>
          )}

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
                        ? 'Live Supabase PostgreSQL Database Connected'
                        : 'Awaiting Supabase Credentials'}
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      {status?.connectionStatus === 'connected'
                        ? 'Production database active. Users, organizations, audits, and findings are being saved directly to your Supabase tables.'
                        : 'StorePulse AI is currently using the local session gateway. To connect your live Supabase project to show people, follow the Connection Guide.'}
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
                  <div className="text-[11px] text-slate-500 mt-1">21 Tables + Solutions Knowledge Base</div>
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
                Locate your API keys in your Supabase Dashboard under{' '}
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
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-bold">Migration 1: 20261110000001_initial_schema.sql</span>
                  <p className="text-[11px] text-slate-400">21 Tables, solutions catalog, plan seeds, and audit findings schema.</p>
                </div>
                <button
                  onClick={() => copyToClipboard(schemaSql || '-- Check supabase/migrations/20261110000001_initial_schema.sql', 'schema')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {copiedTab === 'schema' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTab === 'schema' ? 'Copied to Clipboard' : 'Copy Full Migration SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={schemaSql || 'Loading SQL migration...'}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 resize-none focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'rls' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-bold">Migration 2: 20261110000002_rls_policies.sql</span>
                  <p className="text-[11px] text-slate-400">Tenant boundaries, organization RBAC, and user signup triggers.</p>
                </div>
                <button
                  onClick={() => copyToClipboard(rlsSql || '-- Check supabase/migrations/20261110000002_rls_policies.sql', 'rls')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {copiedTab === 'rls' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTab === 'rls' ? 'Copied to Clipboard' : 'Copy Full Migration SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={rlsSql || 'Loading SQL migration...'}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 resize-none focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            StorePulse AI &middot; Super Admin Configuration
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
