-- ============================================================================
-- STOREPULSE AI - PHASE 1 ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Migration: 20261110000002_rls_policies.sql
-- Description: Strict tenant isolation, RBAC functions, and security policies
-- ============================================================================

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
    SELECT coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), auth.uid()::text)::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = public.current_user_id() AND system_role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = target_org_id
          AND user_id = public.current_user_id()
    ) OR public.is_admin();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_org_role(target_org_id UUID)
RETURNS member_role AS $$
    SELECT role FROM public.organization_members
    WHERE organization_id = target_org_id
      AND user_id = public.current_user_id()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- ENABLE RLS ON ALL PUBLIC TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawled_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_solutions_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view knowledge base solutions"
    ON public.audit_solutions_knowledge_base FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (id = public.current_user_id() OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = public.current_user_id());

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = public.current_user_id());

-- ----------------------------------------------------------------------------
-- 2. ORGANIZATIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view their organizations"
    ON public.organizations FOR SELECT
    USING (public.is_org_member(id));

CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations FOR INSERT
    WITH CHECK (public.current_user_id() IS NOT NULL);

CREATE POLICY "Owners and admins can update their organization"
    ON public.organizations FOR UPDATE
    USING (
        public.get_org_role(id) IN ('owner', 'admin') 
        OR public.is_admin()
    );

-- ----------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view members of their organization"
    ON public.organization_members FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Owners and admins can manage organization members"
    ON public.organization_members FOR ALL
    USING (
        public.get_org_role(organization_id) IN ('owner', 'admin')
        OR public.is_admin()
    );

-- ----------------------------------------------------------------------------
-- 4. PLANS POLICIES (Public catalog, Admin editable)
-- ----------------------------------------------------------------------------
CREATE POLICY "Public can view active plans"
    ON public.plans FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage plans"
    ON public.plans FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. SUBSCRIPTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view their organization subscription"
    ON public.subscriptions FOR SELECT
    USING (public.is_org_member(organization_id));

-- Subscriptions are managed by backend service role or admins
CREATE POLICY "Admins can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. STORES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view stores in their organization"
    ON public.stores FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Members can create stores in their organization"
    ON public.stores FOR INSERT
    WITH CHECK (
        public.is_org_member(organization_id)
        AND public.get_org_role(organization_id) IN ('owner', 'admin', 'member')
    );

CREATE POLICY "Members can update stores in their organization"
    ON public.stores FOR UPDATE
    USING (
        public.is_org_member(organization_id)
        AND public.get_org_role(organization_id) IN ('owner', 'admin', 'member')
    );

CREATE POLICY "Owners and admins can delete stores"
    ON public.stores FOR DELETE
    USING (
        public.get_org_role(organization_id) IN ('owner', 'admin')
        OR public.is_admin()
    );

-- ----------------------------------------------------------------------------
-- 7. AUDITS, FINDINGS, SCORES, PAGES & REPORTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view audits for their organization"
    ON public.audits FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Members can create audits for their organization"
    ON public.audits FOR INSERT
    WITH CHECK (public.is_org_member(organization_id));

CREATE POLICY "Members can view audit scores"
    ON public.audit_scores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.audits a
            WHERE a.id = audit_id AND public.is_org_member(a.organization_id)
        )
    );

CREATE POLICY "Members can view audit findings"
    ON public.audit_findings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.audits a
            WHERE a.id = audit_id AND public.is_org_member(a.organization_id)
        )
    );

CREATE POLICY "Members can view crawled pages"
    ON public.crawled_pages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.audits a
            WHERE a.id = audit_id AND public.is_org_member(a.organization_id)
        )
    );

CREATE POLICY "Members can view reports for their organization"
    ON public.reports FOR SELECT
    USING (public.is_org_member(organization_id));

-- ----------------------------------------------------------------------------
-- 8. REPORT SHARES (Public token access + Org Management)
-- ----------------------------------------------------------------------------
CREATE POLICY "Public token access for reports"
    ON public.report_shares FOR SELECT
    USING (
        expires_at IS NULL OR expires_at > timezone('utc'::text, now())
    );

CREATE POLICY "Members can manage report shares"
    ON public.report_shares FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.reports r
            WHERE r.id = report_id AND public.is_org_member(r.organization_id)
        )
    );

-- ----------------------------------------------------------------------------
-- 9. ACTION ITEMS
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view and manage action items"
    ON public.action_items FOR ALL
    USING (public.is_org_member(organization_id));

-- ----------------------------------------------------------------------------
-- 10. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view and manage their own notifications"
    ON public.notifications FOR ALL
    USING (user_id = public.current_user_id());

-- ----------------------------------------------------------------------------
-- 11. USAGE LOGS
-- ----------------------------------------------------------------------------
CREATE POLICY "Members can view organization usage logs"
    ON public.usage_logs FOR SELECT
    USING (public.is_org_member(organization_id));

-- ----------------------------------------------------------------------------
-- 12. ADMIN AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE POLICY "Only admins can view admin audit logs"
    ON public.admin_audit_logs FOR SELECT
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- AUTOMATIC PROFILE & DEFAULT ORG CREATION TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    org_slug TEXT;
    user_name TEXT;
BEGIN
    user_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    org_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substring(new.id::text, 1, 6);

    -- 1. Create Organization for the user
    INSERT INTO public.organizations (name, slug)
    VALUES (user_name || '''s Team', org_slug)
    RETURNING id INTO new_org_id;

    -- 2. Create User Profile
    INSERT INTO public.profiles (id, email, full_name, system_role, current_organization_id)
    VALUES (new.id, new.email, user_name, 'free_user', new_org_id);

    -- 3. Set Org Creator
    UPDATE public.organizations SET created_by = new.id WHERE id = new_org_id;

    -- 4. Add User as Owner in Organization Members
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, new.id, 'owner');

    -- 5. Create Default Free Subscription
    INSERT INTO public.subscriptions (organization_id, plan_id, status)
    VALUES (new_org_id, 'free', 'active');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (runs automatically in Supabase Auth upon signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
