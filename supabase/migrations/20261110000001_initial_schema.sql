-- ============================================================================
-- STOREPULSE AI - PHASE 1 FOUNDATION SCHEMA
-- ============================================================================
-- Migration: 20261110000001_initial_schema.sql
-- Description: Core schema for multi-tenant SaaS: profiles, organizations,
--              memberships, stores, audits, findings, subscriptions, usage, logs.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('visitor', 'free_user', 'paid_user', 'agency_user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_status AS ENUM ('queued', 'crawling', 'analyzing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE finding_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_category AS ENUM (
        'technical_seo',
        'performance',
        'ux_conversion',
        'product_optimization',
        'trust_signals',
        'content_quality',
        'technical_health'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE store_platform AS ENUM ('woocommerce', 'shopify', 'magento', 'opencart', 'bigcommerce', 'custom', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    system_role user_role NOT NULL DEFAULT 'free_user',
    current_organization_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. ORGANIZATIONS (Tenant Boundary)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    branding JSONB DEFAULT '{"primary_color": "#2563EB", "logo_url": null}'::jsonb,
    is_agency BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Foreign key link back to profiles
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS fk_profiles_current_organization;
ALTER TABLE public.profiles 
    ADD CONSTRAINT fk_profiles_current_organization 
    FOREIGN KEY (current_organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERS (Multi-tenant RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 4. PLANS & PRICING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY, -- 'free', 'starter', 'growth', 'agency', 'business'
    name TEXT NOT NULL,
    description TEXT,
    monthly_price_cents INTEGER NOT NULL DEFAULT 0,
    annual_price_cents INTEGER NOT NULL DEFAULT 0,
    max_monthly_audits INTEGER NOT NULL,
    max_crawled_pages_per_audit INTEGER NOT NULL,
    max_connected_stores INTEGER NOT NULL DEFAULT 0,
    max_team_seats INTEGER NOT NULL DEFAULT 1,
    can_export_pdf BOOLEAN NOT NULL DEFAULT false,
    can_whitelabel_reports BOOLEAN NOT NULL DEFAULT false,
    can_access_ai_assistant BOOLEAN NOT NULL DEFAULT false,
    can_run_monitoring BOOLEAN NOT NULL DEFAULT false,
    features_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. SUBSCRIPTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id),
    status subscription_status NOT NULL DEFAULT 'active',
    billing_interval TEXT NOT NULL DEFAULT 'monthly', -- 'monthly' or 'annual'
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '30 days'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    payment_provider TEXT, -- 'stripe', 'test', etc.
    payment_provider_sub_id TEXT,
    payment_provider_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id)
);

-- ----------------------------------------------------------------------------
-- 6. STORES (E-Commerce websites tracked by organization)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    normalized_domain TEXT NOT NULL,
    detected_platform store_platform NOT NULL DEFAULT 'unknown',
    platform_confidence NUMERIC(4,3) DEFAULT 0.000,
    is_connected BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, normalized_domain)
);

-- ----------------------------------------------------------------------------
-- 7. STORE INTEGRATIONS (Encrypted credentials for WooCommerce / Shopify)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE UNIQUE,
    platform store_platform NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, error, disconnected
    encrypted_credentials TEXT NOT NULL, -- AES-256-GCM cipher
    authorized_scopes TEXT[] NOT NULL DEFAULT '{}',
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'idle',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 8. AUDITS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    target_url TEXT NOT NULL,
    normalized_domain TEXT NOT NULL,
    status audit_status NOT NULL DEFAULT 'queued',
    pages_crawled INTEGER NOT NULL DEFAULT 0,
    pages_limit INTEGER NOT NULL DEFAULT 10,
    overall_health_score NUMERIC(5,2),
    scoring_version TEXT NOT NULL DEFAULT '1.0.0',
    crawl_metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 9. CRAWLED PAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crawled_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status_code INTEGER,
    page_type TEXT NOT NULL DEFAULT 'informational', -- homepage, product, category, cart, checkout, info
    title TEXT,
    meta_description TEXT,
    canonical_url TEXT,
    word_count INTEGER DEFAULT 0,
    h1_count INTEGER DEFAULT 0,
    images_count INTEGER DEFAULT 0,
    missing_alt_images_count INTEGER DEFAULT 0,
    load_time_ms INTEGER,
    raw_headers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 10. AUDIT SCORES (Deterministic Category Breakdown)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE UNIQUE,
    technical_seo_score NUMERIC(5,2) NOT NULL,
    performance_score NUMERIC(5,2) NOT NULL,
    ux_conversion_score NUMERIC(5,2) NOT NULL,
    product_optimization_score NUMERIC(5,2) NOT NULL,
    trust_signals_score NUMERIC(5,2) NOT NULL,
    content_quality_score NUMERIC(5,2) NOT NULL,
    technical_health_score NUMERIC(5,2) NOT NULL,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 11. AUDIT FINDINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    category audit_category NOT NULL,
    severity finding_severity NOT NULL,
    issue_name TEXT NOT NULL,
    affected_url TEXT NOT NULL,
    evidence TEXT NOT NULL,
    explanation TEXT NOT NULL,
    recommended_solution TEXT NOT NULL,
    is_measured BOOLEAN NOT NULL DEFAULT true, -- true = measured, false = inferred
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 12. REPORTS (AI Summary, Roadmap, Exports)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE UNIQUE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    executive_summary TEXT,
    growth_opportunities JSONB DEFAULT '[]'::jsonb,
    quick_wins JSONB DEFAULT '[]'::jsonb,
    thirty_day_roadmap JSONB DEFAULT '[]'::jsonb,
    ai_model_used TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 13. REPORT SHARES (Publicly shareable link with optional token & expiry)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.report_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE,
    is_password_protected BOOLEAN NOT NULL DEFAULT false,
    password_hash TEXT,
    expires_at TIMESTAMPTZ,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 14. ACTION ITEMS (User actionable checklist from audit)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category audit_category NOT NULL,
    priority finding_severity NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo', -- todo, in_progress, completed, dismissed
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 15. PAYMENT EVENTS (Webhook ledger for audit and verification)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    event_id TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL, -- stripe, etc.
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 16. USAGE LOGS (Metering for audits, crawled pages, AI tokens)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'audit_run', 'pages_crawled', 'ai_tokens', 'report_pdf'
    quantity INTEGER NOT NULL DEFAULT 1,
    period_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 17. MONITORING JOBS & RESULTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.monitoring_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    frequency TEXT NOT NULL DEFAULT 'weekly', -- daily, weekly, monthly
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.monitoring_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.monitoring_jobs(id) ON DELETE CASCADE,
    status_code INTEGER,
    response_time_ms INTEGER,
    issues_detected INTEGER DEFAULT 0,
    summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 18. TEAM INVITATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role member_role NOT NULL DEFAULT 'member',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 19. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 20. ADMIN AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- SEED INITIAL PLANS
-- ----------------------------------------------------------------------------
INSERT INTO public.plans (
    id, name, description, monthly_price_cents, annual_price_cents,
    max_monthly_audits, max_crawled_pages_per_audit, max_connected_stores,
    max_team_seats, can_export_pdf, can_whitelabel_reports,
    can_access_ai_assistant, can_run_monitoring, features_list
) VALUES 
(
    'free',
    'Free Plan',
    'Essential diagnostics for new store owners',
    0, 0,
    1, 10, 0,
    1, false, false,
    false, false,
    '["1 store audit per month", "10 pages crawled per audit", "Basic SEO & Performance scores", "5 key recommendations", "In-app diagnostic report", "StorePulse branding"]'::jsonb
),
(
    'starter',
    'Starter Plan',
    'Complete intelligence for growing small e-commerce stores',
    1900, 19000,
    10, 100, 1,
    1, true, false,
    true, false,
    '["10 audits per month", "Up to 100 pages crawled", "Full SEO, UX & Trust analysis", "AI Recommendation Engine", "PDF Export capability", "AI Report Assistant", "1 connected WooCommerce store", "Email support"]'::jsonb
),
(
    'growth',
    'Growth Plan',
    'Advanced analytics & multi-store intelligence',
    4900, 49000,
    30, 500, 3,
    2, true, false,
    true, true,
    '["30 audits per month", "Up to 500 pages crawled", "3 connected stores (Woo/Shopify)", "Sales, Revenue & Inventory Insights", "Scheduled monthly audits", "Historical comparisons", "Priority AI processing"]'::jsonb
),
(
    'agency',
    'Agency Plan',
    'Client workspaces and white-label reporting for digital agencies',
    9900, 99000,
    100, 1000, 10,
    3, true, true,
    true, true,
    '["100 audits per month", "Up to 1,000 pages crawled", "10 connected client stores", "White-label custom PDF reports", "Agency custom branding", "Shareable interactive reports", "3 team member seats", "Client report management"]'::jsonb
),
(
    'business',
    'Business Plan',
    'High-volume enterprise audits and dedicated e-commerce operators',
    19900, 199000,
    300, 2000, 25,
    10, true, true,
    true, true,
    '["300 audits per month", "Up to 2,000 pages crawled", "25 connected stores", "Up to 10 team seats", "Advanced continuous monitoring", "Competitor public comparison", "Highest AI limits & priority processing", "Advanced export suite"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    monthly_price_cents = EXCLUDED.monthly_price_cents,
    annual_price_cents = EXCLUDED.annual_price_cents,
    max_monthly_audits = EXCLUDED.max_monthly_audits,
    max_crawled_pages_per_audit = EXCLUDED.max_crawled_pages_per_audit,
    max_connected_stores = EXCLUDED.max_connected_stores,
    max_team_seats = EXCLUDED.max_team_seats,
    can_export_pdf = EXCLUDED.can_export_pdf,
    can_whitelabel_reports = EXCLUDED.can_whitelabel_reports,
    can_access_ai_assistant = EXCLUDED.can_access_ai_assistant,
    can_run_monitoring = EXCLUDED.can_run_monitoring,
    features_list = EXCLUDED.features_list;
