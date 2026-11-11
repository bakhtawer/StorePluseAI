import React, { useEffect, useState } from 'react';
import { Plan } from '../../types/database.ts';
import { Check, Zap, Building2, Shield, ArrowRight } from 'lucide-react';

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Essential diagnostics for new store owners',
    monthly_price_cents: 0,
    annual_price_cents: 0,
    max_monthly_audits: 1,
    max_crawled_pages_per_audit: 10,
    max_connected_stores: 0,
    max_team_seats: 1,
    can_export_pdf: false,
    can_whitelabel_reports: false,
    can_access_ai_assistant: false,
    can_run_monitoring: false,
    features_list: [
      '1 store audit per month',
      '10 pages crawled per audit',
      'Basic SEO & Performance scores',
      '5 key recommendations',
      'In-app diagnostic report',
      'StorePulse branding'
    ],
    is_active: true
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'Complete intelligence for growing small e-commerce stores',
    monthly_price_cents: 1900,
    annual_price_cents: 19000,
    max_monthly_audits: 10,
    max_crawled_pages_per_audit: 100,
    max_connected_stores: 1,
    max_team_seats: 1,
    can_export_pdf: true,
    can_whitelabel_reports: false,
    can_access_ai_assistant: true,
    can_run_monitoring: false,
    features_list: [
      '10 audits per month',
      'Up to 100 pages crawled',
      'Full SEO, UX & Trust analysis',
      'AI Recommendation Engine',
      'PDF Export capability',
      'AI Report Assistant',
      '1 connected WooCommerce store',
      'Email support'
    ],
    is_active: true
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    description: 'Advanced analytics & multi-store intelligence',
    monthly_price_cents: 4900,
    annual_price_cents: 49000,
    max_monthly_audits: 30,
    max_crawled_pages_per_audit: 500,
    max_connected_stores: 3,
    max_team_seats: 2,
    can_export_pdf: true,
    can_whitelabel_reports: false,
    can_access_ai_assistant: true,
    can_run_monitoring: true,
    features_list: [
      '30 audits per month',
      'Up to 500 pages crawled',
      '3 connected stores (Woo/Shopify)',
      'Sales, Revenue & Inventory Insights',
      'Scheduled monthly audits',
      'Historical comparisons',
      'Priority AI processing'
    ],
    is_active: true
  },
  {
    id: 'agency',
    name: 'Agency Plan',
    description: 'Client workspaces and white-label reporting for digital agencies',
    monthly_price_cents: 9900,
    annual_price_cents: 99000,
    max_monthly_audits: 100,
    max_crawled_pages_per_audit: 1000,
    max_connected_stores: 10,
    max_team_seats: 3,
    can_export_pdf: true,
    can_whitelabel_reports: true,
    can_access_ai_assistant: true,
    can_run_monitoring: true,
    features_list: [
      '100 audits per month',
      'Up to 1,000 pages crawled',
      '10 connected client stores',
      'White-label custom PDF reports',
      'Agency custom branding',
      'Shareable interactive reports',
      '3 team member seats',
      'Client report management'
    ],
    is_active: true
  },
  {
    id: 'business',
    name: 'Business Plan',
    description: 'High-volume enterprise audits and dedicated e-commerce operators',
    monthly_price_cents: 19900,
    annual_price_cents: 199000,
    max_monthly_audits: 300,
    max_crawled_pages_per_audit: 2000,
    max_connected_stores: 25,
    max_team_seats: 10,
    can_export_pdf: true,
    can_whitelabel_reports: true,
    can_access_ai_assistant: true,
    can_run_monitoring: true,
    features_list: [
      '300 audits per month',
      'Up to 2,000 pages crawled',
      '25 connected stores',
      'Up to 10 team seats',
      'Advanced continuous monitoring',
      'Competitor public comparison',
      'Highest AI limits & priority processing',
      'Advanced export suite'
    ],
    is_active: true
  }
];

export const BillingView: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    fetch('/api/v1/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.plans && data.plans.length > 0) setPlans(data.plans);
      })
      .catch((err) => console.warn('Using default plans:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
          <span>Phase 2 Architecture</span>
          <span>·</span>
          <span>Subscription Plans & Usage Quotas</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Plans & Subscription Management</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          StorePulse AI features deterministic server-side feature gating, strict monthly audit quotas, and crawl depth limits enforced per organization.
        </p>
      </div>

      {/* Cadence Selector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-1.5 rounded-md font-semibold transition-colors ${
              billingInterval === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={`px-4 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              billingInterval === 'annual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
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
          const price = billingInterval === 'monthly' 
            ? p.monthly_price_cents / 100 
            : Math.round(p.annual_price_cents / 1200);

          const isCurrent = p.id === 'free';
          const isPopular = p.id === 'growth';

          return (
            <div
              key={p.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isPopular
                  ? 'bg-slate-900 border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                {isPopular && (
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                    Most Popular
                  </div>
                )}
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 min-h-[32px] leading-tight">{p.description}</p>

                <div className="mt-4 mb-4 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white font-mono">${price}</span>
                    <span className="text-xs text-slate-400">/mo</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {billingInterval === 'annual' ? `Billed $${p.annual_price_cents / 100} annually` : 'Billed monthly'}
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
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-300 leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2 bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => alert(`Upgrading to ${p.name} will be active in Phase 2 with verified payment webhook!`)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/30 transition-colors"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
