import { Plan } from '../types/database.ts';

export const ALL_PLANS: Plan[] = [
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
      '5 prioritized recommendations',
      'In-app diagnostic report',
      'StorePulse standard branding'
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
      'PDF & JSON Export capability',
      'AI Report Assistant',
      '1 connected WooCommerce store',
      'Standard email support'
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
      '3 connected stores (Woo / Shopify)',
      'Sales, Revenue & Inventory Insights',
      'Automated 24/7 store monitoring',
      'Historical score comparisons',
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
      'Agency custom branding & logo',
      'Shareable interactive reports',
      '3 team member seats',
      'Dedicated priority support'
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
      'Continuous real-time store monitoring',
      'Competitor public comparison',
      'Highest AI limits & priority SLA',
      'Custom API access'
    ],
    is_active: true
  }
];

export function getPlanById(planId: string): Plan {
  const found = ALL_PLANS.find((p) => p.id === planId.toLowerCase());
  return found || ALL_PLANS[0];
}
