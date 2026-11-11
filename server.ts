import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import { isServerSupabaseConfigured, supabaseAdmin, verifyUserToken } from './server/supabase.js';
import { analyzeStoreUrl } from './server/analyzer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json());

  // API Health Check
  app.get('/api/v1/health', async (req, res) => {
    let dbStatus = 'not_configured';
    let dbError = null;

    if (isServerSupabaseConfigured && supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin.from('plans').select('id').limit(1);
        dbStatus = error ? 'error' : 'connected';
        if (error) dbError = error.message;
      } catch (err: any) {
        dbStatus = 'error';
        dbError = err.message;
      }
    }

    res.json({
      status: 'ok',
      service: 'StorePulse AI SaaS Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      supabase: {
        configured: isServerSupabaseConfigured,
        status: dbStatus,
        error: dbError,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // POST /api/v1/analyze - Analyze E-Commerce Store URL
  app.post('/api/v1/analyze', async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'A valid website or store URL is required' });
    }

    try {
      const report = await analyzeStoreUrl(url.trim());

      // If Supabase is connected, record audit details and possible solutions to PostgreSQL
      if (isServerSupabaseConfigured && supabaseAdmin) {
        try {
          const { data: orgs } = await supabaseAdmin.from('organizations').select('id').limit(1);
          const defaultOrgId = orgs && orgs.length > 0 ? orgs[0].id : null;

          if (defaultOrgId) {
            const { data: auditRow } = await supabaseAdmin
              .from('audits')
              .insert({
                organization_id: defaultOrgId,
                target_url: report.target_url,
                normalized_domain: report.normalized_domain,
                status: 'completed',
                pages_crawled: 1,
                pages_limit: 10,
                overall_health_score: report.overall_score,
                scoring_version: '1.0.0',
                crawl_metadata: {
                  platform: report.detected_platform,
                  metrics: report.metrics,
                },
                completed_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (auditRow) {
              await supabaseAdmin.from('audit_scores').insert({
                audit_id: auditRow.id,
                technical_seo_score: report.category_scores.technical_seo,
                performance_score: report.category_scores.performance,
                ux_conversion_score: report.category_scores.ux_conversion,
                product_optimization_score: report.category_scores.product_optimization,
                trust_signals_score: report.category_scores.trust_signals,
                content_quality_score: report.category_scores.content_quality,
                technical_health_score: report.category_scores.technical_health,
                score_breakdown: report.category_scores,
              });

              const findingsRows = report.findings.map((f) => ({
                audit_id: auditRow.id,
                category: f.category,
                severity: f.severity,
                issue_name: f.issue_name,
                affected_url: f.affected_url,
                evidence: f.evidence,
                root_cause: f.root_cause || null,
                explanation: f.explanation,
                recommended_solution: f.recommended_solution,
                solution_steps: f.solution_steps || [],
                code_snippet: f.code_snippet || null,
                platform_solutions: f.platform_solutions || {},
                is_measured: f.is_measured,
              }));

              if (findingsRows.length > 0) {
                await supabaseAdmin.from('audit_findings').insert(findingsRows);
              }
            }
          }
        } catch (dbErr: any) {
          console.warn('Could not persist audit record to Supabase:', dbErr.message);
        }
      }

      res.json({ success: true, report });
    } catch (err: any) {
      console.error('Audit analysis failed for URL:', url, err.message);
      res.status(400).json({
        error: err.message || 'Failed to analyze store URL. Please verify the URL is publicly reachable.',
      });
    }
  });

  // GET /api/v1/admin/migrations/:id - Retrieve SQL migration file for Super Admin setup
  app.get('/api/v1/admin/migrations/:id', async (req, res) => {
    const { id } = req.params;
    let fileName = '';
    if (id === 'schema' || id === '1') {
      fileName = '20261110000001_initial_schema.sql';
    } else if (id === 'rls' || id === '2') {
      fileName = '20261110000002_rls_policies.sql';
    } else {
      return res.status(404).json({ error: 'Migration file not found' });
    }

    try {
      const filePath = path.join(__dirname, 'supabase', 'migrations', fileName);
      const sqlContent = await fs.promises.readFile(filePath, 'utf-8');
      res.json({ fileName, sql: sqlContent });
    } catch (err: any) {
      res.status(500).json({ error: `Failed to read migration: ${err.message}` });
    }
  });

  // GET Active Plans
  app.get('/api/v1/plans', async (req, res) => {
    if (isServerSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price_cents', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json({ plans: data });
    }

    // Default seeded plans
    res.json({
      plans: [
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
        }
      ]
    });
  });

  // GET Current User Profile and Organization
  app.get('/api/v1/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    const { user, error, isDevMock } = await verifyUserToken(authHeader);

    if (error || !user) {
      return res.status(401).json({ error: error || 'Unauthorized' });
    }

    if (isServerSupabaseConfigured && supabaseAdmin && !isDevMock) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: memberships } = await supabaseAdmin
        .from('organization_members')
        .select('*, organization:organizations(*)')
        .eq('user_id', user.id);

      return res.json({
        user,
        profile,
        memberships: memberships || [],
      });
    }

    // Dev/Preview Mock representation
    res.json({
      user,
      profile: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'StorePulse Founder',
        system_role: 'admin',
        current_organization_id: 'org-default-001',
      },
      memberships: [
        {
          id: 'mem-001',
          organization_id: 'org-default-001',
          role: 'owner',
          organization: {
            id: 'org-default-001',
            name: 'StorePulse Commerce Lab',
            slug: 'storepulse-commerce-lab',
            is_agency: false,
          },
        },
      ],
    });
  });

  // Mount Vite middleware in development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StorePulse AI server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
