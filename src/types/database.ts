export type UserRole = 'visitor' | 'free_user' | 'paid_user' | 'agency_user' | 'admin';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
export type AuditStatus = 'queued' | 'crawling' | 'analyzing' | 'completed' | 'failed';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AuditCategory = 
  | 'technical_seo'
  | 'performance'
  | 'ux_conversion'
  | 'product_optimization'
  | 'trust_signals'
  | 'content_quality'
  | 'technical_health';

export type StorePlatform = 'woocommerce' | 'shopify' | 'magento' | 'opencart' | 'bigcommerce' | 'custom' | 'unknown';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  system_role: UserRole;
  current_organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by: string | null;
  branding: {
    primary_color: string;
    logo_url: string | null;
  };
  is_agency: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  profile?: Profile;
  organization?: Organization;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthly_price_cents: number;
  annual_price_cents: number;
  max_monthly_audits: number;
  max_crawled_pages_per_audit: number;
  max_connected_stores: number;
  max_team_seats: number;
  can_export_pdf: boolean;
  can_whitelabel_reports: boolean;
  can_access_ai_assistant: boolean;
  can_run_monitoring: boolean;
  features_list: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_interval: 'monthly' | 'annual';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_provider?: string;
  plan?: Plan;
}

export interface Store {
  id: string;
  organization_id: string;
  name: string;
  url: string;
  normalized_domain: string;
  detected_platform: StorePlatform;
  platform_confidence: number;
  is_connected: boolean;
  created_at: string;
}

export interface Audit {
  id: string;
  organization_id: string;
  store_id: string | null;
  target_url: string;
  normalized_domain: string;
  status: AuditStatus;
  pages_crawled: number;
  pages_limit: number;
  overall_health_score: number | null;
  scoring_version: string;
  crawl_metadata?: Record<string, any>;
  error_message?: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AuditFinding {
  id: string;
  audit_id: string;
  category: AuditCategory;
  severity: FindingSeverity;
  issue_name: string;
  affected_url: string;
  evidence: string;
  explanation: string;
  recommended_solution: string;
  is_measured: boolean;
  metadata?: Record<string, any>;
}

export interface AuditScores {
  id: string;
  audit_id: string;
  technical_seo_score: number;
  performance_score: number;
  ux_conversion_score: number;
  product_optimization_score: number;
  trust_signals_score: number;
  content_quality_score: number;
  technical_health_score: number;
  score_breakdown: Record<string, any>;
}

export interface UsageSummary {
  monthlyAuditsUsed: number;
  monthlyAuditsLimit: number;
  pagesCrawledThisMonth: number;
  connectedStoresCount: number;
  connectedStoresLimit: number;
  plan: Plan;
}
