import React, { useEffect, useState } from 'react';
import { Plan } from '../../types/database.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ALL_PLANS } from '../../lib/plans.ts';
import { Check, Zap, Building2, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const BillingView: React.FC<{
  onSelectTab?: (tab: string) => void;
}> = ({ onSelectTab }) => {
  const { activePlanId, activePlan, changePlan, profile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(ALL_PLANS);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [upgradeNotification, setUpgradeNotification] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.plans && data.plans.length > 0) setPlans(data.plans);
      })
      .catch((err) => console.warn('Using default plans:', err));
  }, []);

  const handlePlanSelection = async (plan: Plan) => {
    if (plan.id === activePlanId) return;
    setIsUpdating(plan.id);

    const { error } = await changePlan(plan.id);
    setIsUpdating(null);

    if (!error) {
      setUpgradeNotification(
        `Workspace successfully updated to ${plan.name}! Your monthly quota has been adjusted to ${plan.max_monthly_audits} audits with crawl depth of ${plan.max_crawled_pages_per_audit} pages.`
      );
      setTimeout(() => {
        setUpgradeNotification(null);
      }, 7000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">
            <span>Subscription & Quotas</span>
            <span>·</span>
            <span>Current Tier: <span className="text-white capitalize">{activePlan.name}</span></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Plans & Subscription Management</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Choose the intelligence scale that fits your store or agency. Monthly audit quotas, multi-page crawl depths, and store monitoring are enforced deterministically.
          </p>
        </div>

        {onSelectTab && (
          <button
            onClick={() => onSelectTab('dashboard')}
            className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/80 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Upgrade Notification Toast / Banner */}
      {upgradeNotification && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/50">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{upgradeNotification}</span>
          </div>
          <button
            onClick={() => setUpgradeNotification(null)}
            className="text-emerald-400 hover:text-white text-xs font-semibold cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cadence Selector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              billingInterval === 'monthly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={`px-4 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              billingInterval === 'annual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Save 16%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {plans.map((p) => {
          const price =
            billingInterval === 'monthly'
              ? p.monthly_price_cents / 100
              : Math.round(p.annual_price_cents / 1200);

          const isCurrent = p.id === activePlanId;
          const isPopular = p.id === 'growth';

          return (
            <div
              key={p.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                  : isPopular
                  ? 'bg-slate-900/90 border-indigo-500/50'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {isPopular && (
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 ml-auto">
                      Active Plan
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 min-h-[32px] leading-tight">
                  {p.description}
                </p>

                <div className="mt-4 mb-4 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white font-mono">${price}</span>
                    <span className="text-xs text-slate-400">/mo</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {billingInterval === 'annual' && p.annual_price_cents > 0
                      ? `Billed $${p.annual_price_cents / 100} annually`
                      : 'Billed monthly'}
                  </div>
                </div>

                {/* Quota Highlights */}
                <div className="space-y-2 text-xs font-mono text-slate-300 mb-4 pb-4 border-b border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Audits:</span>
                    <span className="font-bold text-white">{p.max_monthly_audits}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pages/Audit:</span>
                    <span className="font-bold text-white">{p.max_crawled_pages_per_audit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stores:</span>
                    <span className="font-bold text-white">{p.max_connected_stores}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2 text-xs text-slate-300">
                  {p.features_list.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-300 leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2 bg-slate-800 text-emerald-400 text-xs font-semibold rounded-lg cursor-default border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Current Active Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlanSelection(p)}
                    disabled={isUpdating === p.id}
                    className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>
                      {isUpdating === p.id
                        ? 'Updating...'
                        : p.monthly_price_cents > (activePlan.monthly_price_cents || 0)
                        ? `Upgrade to ${p.name}`
                        : `Switch to ${p.name}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Tier Capabilities & Gating Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pr-4">Feature / Capability</th>
                <th className="py-2.5 px-3">Free ($0)</th>
                <th className="py-2.5 px-3">Starter ($19)</th>
                <th className="py-2.5 px-3 text-indigo-400">Growth ($49)</th>
                <th className="py-2.5 px-3">Agency ($99)</th>
                <th className="py-2.5 pl-3">Business ($199)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 pr-4 font-sans text-white font-medium">Monthly Audits</td>
                <td className="py-2.5 px-3">1</td>
                <td className="py-2.5 px-3">10</td>
                <td className="py-2.5 px-3 text-indigo-300 font-bold">30</td>
                <td className="py-2.5 px-3">100</td>
                <td className="py-2.5 pl-3">300</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-white font-medium">Crawl Page Limit</td>
                <td className="py-2.5 px-3">10 pages</td>
                <td className="py-2.5 px-3">100 pages</td>
                <td className="py-2.5 px-3 text-indigo-300 font-bold">500 pages</td>
                <td className="py-2.5 px-3">1,000 pages</td>
                <td className="py-2.5 pl-3">2,000 pages</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-white font-medium">PDF & Raw JSON Export</td>
                <td className="py-2.5 px-3 text-slate-500">Locked</td>
                <td className="py-2.5 px-3 text-emerald-400">Unlocked</td>
                <td className="py-2.5 px-3 text-emerald-400">Unlocked</td>
                <td className="py-2.5 px-3 text-emerald-400">Unlocked</td>
                <td className="py-2.5 pl-3 text-emerald-400">Unlocked</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-white font-medium">AI Report Assistant</td>
                <td className="py-2.5 px-3 text-slate-500">Locked</td>
                <td className="py-2.5 px-3 text-emerald-400">Unlocked</td>
                <td className="py-2.5 px-3 text-emerald-400">Unlocked</td>
                <td className="py-2.5 px-3 text-emerald-400">Unlocked</td>
                <td className="py-2.5 pl-3 text-emerald-400">Unlocked</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-white font-medium">Connected Stores</td>
                <td className="py-2.5 px-3 text-slate-500">0</td>
                <td className="py-2.5 px-3">1 Woo store</td>
                <td className="py-2.5 px-3 text-indigo-300 font-bold">3 Woo / Shopify</td>
                <td className="py-2.5 px-3">10 stores</td>
                <td className="py-2.5 pl-3">25 stores</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-white font-medium">White-label PDF Reports</td>
                <td className="py-2.5 px-3 text-slate-500">No</td>
                <td className="py-2.5 px-3 text-slate-500">No</td>
                <td className="py-2.5 px-3 text-slate-500">No</td>
                <td className="py-2.5 px-3 text-emerald-400">Yes (Custom Brand)</td>
                <td className="py-2.5 pl-3 text-emerald-400">Yes (Custom Brand)</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-white font-medium">Scheduled 24/7 Monitoring</td>
                <td className="py-2.5 px-3 text-slate-500">No</td>
                <td className="py-2.5 px-3 text-slate-500">No</td>
                <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                <td className="py-2.5 pl-3 text-emerald-400">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
